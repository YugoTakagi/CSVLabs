# CSVLabs

CSVLabs is a web application that plots graphs based on CSV files.
An overview image of this app is as follows:
![the overview image](https://github.com/YugoTakagi/CSVLabs/blob/main/images/overview.png)


## Technologies

This application is consisted of both Python and JavaScript code.
Therefore, please set up the development environments for both.
This project is created with:
- Python: 3.11.3
- Chakra UI: 2.8.2
- React: 18.2.0

## Get start
### Setup

```bash
git clone https://github.com/YugoTakagi/CSVLabs.git

# set up an environment for python.
pip install -r requirements.txt

# set up an environment for javascript.
cd react-app
npm install # to install all dependencies.
```

### How to run

This web application run on http://localhost:3000.

``` bash
# Terminal 1.
python backend.py
```

``` bash
# Terminal 2.
cd react-app
npm start
```

## Appendix

#### Create react-app
```bash
npx create-react-app react-app
cd react-app
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion apexcharts react-apexcharts
npm i chakra-multiselect
```

