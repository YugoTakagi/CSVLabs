import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Box,
  Select,
  ChakraProvider,
  extendTheme
} from '@chakra-ui/react';
import Chart from "react-apexcharts";
// import { Select } from "chakra-react-select";
import { MultiSelectTheme, MultiSelect } from 'chakra-multiselect'


const theme = extendTheme({
  components: {
    MultiSelect: MultiSelectTheme
  }
})


function App() {
  const [file, setFile] = useState(null);
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState([]);
  const [headerRow, setHeaderRow] = useState('0');
  const [chartData, setChartData] = useState({});
  const [columnNames, setColumnNames] = useState([]);  // 列名を格納するステート

  const toast = useToast();
  const [graphType, setGraphType] = useState('line');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // グラフタイプが変更されたときに呼ばれるハンドラ
  const handleGraphTypeChange = (event) => {
    setGraphType(event.target.value);  // 選択されたグラフタイプでステートを更新
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('x_axis_column', xAxisColumn);
    formData.append('y_axis_column', yAxisColumn);
    formData.append('header_row', headerRow);
    formData.append('graph_type', graphType);  // グラフタイプを追加

    try {
      const response = await fetch('http://localhost:8888/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();


        // グラフタイプに応じてグラフオプションを設定
        if (graphType === 'boxPlot') {

          const seriesDataBlock = Object.keys(data).map(key => ({
            name: key,
            data: [
              {
                x: key,  // グラフに表示するラベル名
                y: [
                  data[key].min,
                  data[key].q1,
                  data[key].median,
                  data[key].q3,
                  data[key].max
                ]
              }
            ]
          }));

          const boxPlotOptions = {
            chart: {
              type: 'boxPlot',
              height: 350
            },
            series: seriesDataBlock,
            options: {
              chart: {
                id: 'apexchart-boxplot'
              },
              title: {
                text: 'Box Plot Example',
                align: 'center'
              },
              xaxis: {
                type: 'category'
              },
              tooltip: {
                shared: false,
                intersect: true,
                y: {
                  formatter: function (y) {
                    return y.toFixed(2);  // 小数点以下2桁で数値をフォーマット
                  }
                }
              }
            }
          };
          setChartData(boxPlotOptions);
        } else {

          const seriesData = Object.keys(data.y_axis).map(key => {
            return {
              name: key,
              data: data.y_axis[key]
            };
          });
          // 他のグラフタイプのオプション設定
          setChartData({
            options: {
              chart: {
                type: graphType,
                id: "dynamic-chart"
              },
              xaxis: {
                categories: data.x_axis
              }
            },
            series: seriesData
          });
        }
        toast({
          title: "Success",
          description: "File uploaded and graph generated successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to upload and process the file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 列名を取得する関数
  const fetchData = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('header_row', headerRow);  // ヘッダー行の数を追加

    const response = await fetch('http://localhost:8888/api/get_column_names', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setColumnNames(data);
    } else {
      toast({
        title: "Error",
        description: "Failed to fetch column names",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // オプションが選択されたときの処理を更新
  const handleSelectChange = (selectedOptions) => {
    // selectedOptionsは、選択されたオプションの配列
    setYAxisColumn(selectedOptions.map(option => option.value));  // オプションのvalueを抽出して状態を更新
  };

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.md" centerContent>

        <Heading as="h1" size="xl" textAlign="center" my="6">
          CSV Labs
        </Heading>

        <VStack spacing={5} width="100%">
          <FormControl>
            <FormLabel>CSV File</FormLabel>
            <Input type="file" p="1.5" onChange={handleFileChange} />

            <FormLabel>Header Row Index (optional)</FormLabel>
            <NumberInput min={0} onChange={(value) => setHeaderRow(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <Button mt={4} colorScheme="blue" onClick={fetchData} isFullWidth>Load Column Names</Button>

          <FormControl>
            <FormLabel>X-Axis Column</FormLabel>
            <Select placeholder="Select X-axis column" onChange={(e) => setXAxisColumn(e.target.value)}>
              {columnNames.map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Y-Axis Columns</FormLabel>
            <MultiSelect
              options={columnNames.map(name => ({ label: name, value: name }))}
              value={yAxisColumn.map(value => ({ label: value, value }))}
              placeholder="Select Y-axis columns"
              onChange={handleSelectChange}  // 更新したハンドラを使用
            />
          </FormControl>

          <FormControl>
            <FormLabel>Graph Type</FormLabel>
            <Select value={graphType} onChange={handleGraphTypeChange}>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="pie">Pie Chart</option>
              <option value="boxPlot">Box Plot</option>
            </Select>
          </FormControl>

          <Button colorScheme="blue" onClick={handleUpload} isFullWidth>
            Upload and Generate Chart
          </Button>

          <Box width="100%" p="4" borderWidth="1px" borderRadius="lg">
            {chartData.options && (
              <Chart
                options={chartData.options}
                series={chartData.series}
                type={graphType}
                height="350"
              />
            )}
            {!chartData.options && (
              <Text color="gray.500">Your chart will appear here...</Text>
            )}
          </Box>
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;
