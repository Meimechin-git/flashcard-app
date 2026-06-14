# Flashcard App (LaTeX Support)

数式（LaTeX）を含む長文の解説・導出に対応した、個人学習用フラッシュカードアプリケーションです。
試験 ＞ 教科 ＞ カード の階層構造で学習データを整理でき、ブラウザ上で直感的に作成・編集・学習が可能です。

## 特徴
- **数式対応**: KaTeX を使用し、問題・回答の両方で LaTeX 形式の数式を描画。
- **階層管理**: 複数の試験や教科を自由に作成し、整理して管理可能。
- **大型カードUI**: 単語カードに収まらない長い導出過程なども、スクロール可能な大型UIで表示。
- **ローカル完結**: データは `data.json` に保存され、オフラインでも動作。エディタでの直接編集も可能。
- **キーボード操作**: 学習をスムーズに進めるためのショートカットキー対応。

## 環境・技術構成
- **Runtime**: Node.js
- **Backend**: Express (軽量Webサーバー)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (フレームワーク不使用)
- **Library**: KaTeX (数式レンダリング)
- **Data**: JSON形式によるローカル保存

## セットアップと実行
1. Node.js がインストールされていることを確認してください。
2. 依存パッケージをインストールします：
   ```bash
   npm install
   ```
3. サーバーを起動します：
   ```bash
   node server.js
   ```
4. ブラウザで `http://localhost:3000` にアクセスしてください。

## ファイル構成
```text
flashcard-app/
├── server.js          # Node.jsサーバー（API・ファイル配信）
├── data.json           # 学習データ（階層構造）
├── package.json        # プロジェクト設定・依存関係
└── public/             # フロントエンド資産
    ├── index.html      # メインUI（シングルページ）
    ├── style.css       # デザイン・大型カードUI定義
    └── app.js          # フロントエンドロジック・描画制御
```

## 各ファイルの役割と主要関数

### `server.js` (Backend)
Express を使用した軽量なAPIサーバーです。
- `GET /api/data`: `data.json` を読み込み、クライアントに返します。
- `POST /api/data`: クライアントから送られた全データを `data.json` に上書き保存します。
- `express.static('public')`: `public` フォルダ内の静的ファイル（HTML, CSS, JS）を配信します。

### `public/app.js` (Frontend)
アプリケーションの全ロジックを管理するオブジェクト `app` を中心に構成されています。

#### 主要プロパティ
- `data`: サーバーから取得した全データ（試験・教科・カードの配列）。
- `currentView`: 現在の画面状態 (`home`, `subjects`, `study`, `create-card`)。

#### 主要メソッド
- `fetchData() / saveData()`: サーバーとの通信（JSONの取得・保存）。
- `render()`: `currentView` に基づき、HTMLを動的に生成し KaTeX を適用します。
- `renderStudy()`: 学習モードの描画。数式描画と「答えを表示」の状態管理を行います。
- `submitCard()`: カードの新規作成または既存カードの更新を行い、サーバーへ保存します。
- `add/edit/delete[Exam|Subject|Card]()`: 各階層のCRUD操作をフロントエンドで処理し、保存をトリガーします。

### `public/style.css`
- `.flashcard`: スクロール可能な大型カードのデザイン。
- `.katex`: 数式表示の最適化。
- レイアウトはレスポンシブかつ直感的な操作感を目指した設計です。

## 操作ショートカット
- **Space**: 答えを表示。
- **Enter**: （答え表示後）次のカードへ。

---
Happy Learning!
