from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pandas as pd
import os

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB の最大ファイルサイズを設定
app.json.sort_keys = False  # Jsonのソートを無効にする。

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# 仮にdfがデータフレームであるとします
# def calculate_boxplot_data(df, column_index):
    # series = df.iloc[:, column_index]
def calculate_boxplot_data(df, column):
    series = df.loc[:, column]
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    median = series.median()
    iqr = q3 - q1
    lower_fence = q1 - 1.5 * iqr
    upper_fence = q3 + 1.5 * iqr
    min_val = series[series >= lower_fence].min()
    max_val = series[series <= upper_fence].max()
    
    return {
        'min': float(min_val),
        'q1': float(q1),
        'median': float(median),
        'q3': float(q3),
        'max': float(max_val)
    }


@app.route('/upload', methods=['POST'])
def upload_file():
    # ファイルがリクエストに含まれているか確認
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    # ファイル名が空ではないこと、有効な拡張子を持っていることを確認
    if file.filename == '' or not allowed_file(file.filename):
        return 'Invalid file', 400
    
    try:
        # ファイル名をセキュアにする
        filename = secure_filename(file.filename)
        # フロントエンドから列番号とヘッダー行数を受け取る
        # x_axis_column = request.form.get('x_axis_column', type=int)
        # y_axis_column = request.form.get('y_axis_column', type=int)
        x_axis_column = request.form.get('x_axis_column', type=str)
        y_axis_columns = request.form.get('y_axis_column', type=str)
        y_axis_columns = y_axis_columns.split(",")
        header_row = request.form.get('header_row', type=int, default=0)
        graph_type = request.form.get('graph_type', type=str)
        
        # CSVファイルを安全に読み込む
        if file:
            df = pd.read_csv(file, header=header_row)
            
            # 指定されたX軸とY軸の列をデータフレームから抽出
            x_data = df.loc[:, x_axis_column].tolist()
            y_data = {col: df.loc[:, col].tolist() for col in y_axis_columns}

            if graph_type == 'boxPlot':
                # 箱ひげ図用のデータ処理
                # boxplot_data = calculate_boxplot_data(df, y_axis_columns)
                boxplot_data = {col: calculate_boxplot_data(df, col) for col in y_axis_columns}
                return jsonify(boxplot_data)
            else:
                # 抽出したデータをJSON形式で返す
                graph_data = {
                    'x_axis': x_data,
                    'y_axis': y_data
                }
                return jsonify(graph_data)
    except Exception as e:
        # エラーハンドリング
        return jsonify(error=str(e)), 500


@app.route('/api/get_column_names', methods=['POST'])
def get_column_names():
    file = request.files['file']
    header_row = int(request.form['header_row']) if 'header_row' in request.form else 0
    df = pd.read_csv(file, header=header_row)

    # ここで列名の取得やデータの処理を行う
    column_names = df.columns.tolist()
    return jsonify(column_names)

# 既存のFlaskアプリ定義の後にこれを追加
CORS(app, resources={r"/upload": {"origins": "*"}})

if __name__ == '__main__':
    app.run(port=8888, debug=True)
