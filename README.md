#scrollsmartly.js – Smooth Scroll Library for JavaScript

##1. 概要
Webサイトにページ内スムーズスクロール機能を追加するためのJavaScriptライブラリです。単一ページのサイトなどの制作に役立ちます。 *[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)* (Copyright(C) [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)) をフォークし、機能の追加、アルゴリズムの改善を行ったものです。
##2. 基本的な使い方
headタグ内などで`scrollsmartly.js`ファイルを読み込むだけで、href属性が`#`で始まる、通常はページ内リンクとして機能するa要素全てに対し自動的にスムーズスクロール機能を上書きします。
####読み込み方の例
```html
<script src='PATH/scrollsmartly.js'></script>
```
後述する *scrollsmartly.js* のその他の機能を使わない場合であれば、上記以外のスクリプトを書く必要はありません。

##3. 特徴
* ###`smartly`オブジェクトによる自由なユーザー設定
ライブラリの読み込み直後に生成される`smartly`オブジェクトのプロパティおよびメソッドを用いて、デフォルト動作、スクロール速度などをサイト作成者が変更できます。

* ###スクロールで「戻る」「進む」
*scrollsmoothly.js* と同様、スクロールした後にURLのハッシュ値を変更しますが、 *scrollsmartly.js* には、ブラウザで履歴を前後した際に、URLのハッシュとページの表示位置が一致しないという問題がありました。 *scrollsmartly.js* では、履歴の前後に合わせて適切な位置にスクロールすることで、その問題を解決しています。

* ###ページ最上端へのスクロール
href属性が`#`のみである要素、つまり初期のスクロール位置へのページ内リンクには、 *scrollsmoothly.js* ではスクロール機能が適用されませんでしたが、本ライブラリでは適用できるようにしました。  
通常、そのようなリンクをクリックした際には、URLは`#`で終わる、例えば https://github.com/shinnn/scrollsmartly# のようなものになりますが、本ライブラリでは自動的に`#`を取り除き、 https://github.com/shinnn/scrollsmartly のようなハッシュのないURLに整形します。

* ###その他のライブラリに依存しない
jQueryなどの、本ライブラリ以外のJavaScriptライブラリとの依存関係がありません。ただし、Internet Exproler 6, 7などの[HashChangeEvent](https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/hashchange)を実装していないブラウザでは、履歴の前後に伴うスクロールを行うことができません。旧バージョンのIEなどを含めた多くのブラウザで動作させるには、HashChangeEventを補完するライブラリを別途用意し、下記のように *scrollsmartly.js* より先にロードする必要があります。
```html
<script src='PATH/history.js'></script>
<script src='PATH/scrollsmartly.js'></script>
```
HashChangeEventを補完できるライブラリはいくつか公開されていますが、動作確認を行っているのは[History API JavaScript Library](https://github.com/devote/HTML5-History-API)(© Dmitrii Pakhtinov)です。こちらの使用を推奨します。

##4. API

###プロパティ
* ####`smartly.applyDefault`
型: **Boolean**  
初期値: **true**  
`true`である場合、`window.load`イベント発生時に`smartly.init`メソッドを実行します。`false`である場合は実行されません。  
本プロパティの真偽判定は`window.load`イベント発生時に行われます。よって、本プロパティの値を変更するのは`window.load`イベント発生より前のタイミングである必要があります。

* ####`smartly.scrollIn`
型: **Boolean**  
初期値: **true**  
`true`である場合、ページの読み込み時に

* ####`smartly.scrollingTo`
型: **Object (HTMLElement)**  
初期値: **null**  
現在のスクロール先要素です。`smartly.scroll`メソッドが実行された際に、最終的なスクロール先となる要素が本プロパティに代入されます。スクロールが完了したときに、初期値である`null`が再度代入されます。

* ####`smartly.scrolledTo`
型: **Object (HTMLElement)**  
初期値: **null**  
直前のスクロールで到達した要素です。`smartly.scroll`メソッドによるスクロールが完了した直後に、その際のスクロール先だった要素が代入されます。

* ####`smartly.callback`
型: **Function**  
初期値: **undefined**  
`smartly.scroll`メソッドによるスクロールが完了した際に実行するコールバック関数を指定できます。コールバック関数が実行される直前に、`scrolledTo`プロパティは更新され、`scrollingTo`プロパティは`null`になります。

###メソッド
* ####`smartly.init`
全てのページ内リンクのデフォルト動作を無効 (
`event.preventDefault`と`event.stopPropagation`を実行）にし、代わりに、本来のリンク先であるアンカーへのスムーズスクロールを起動するボタンにします。

* ####`smartly.scroll([id])`
指定したid属性を持つ要素へのスクロールを行います。  
引数1: **hash**

* ####`smartly.on(element [, id])`
指定した要素のクリックイベントに、`smartly.scroll`メソッドを紐付けます。
引数1: **element**  
引数2: **hash**

* ####`smartly.off(element)`
指定した要素のクリックイベントに紐付いている`smartly.scroll`メソッドを取り除きます。  
引数1: **element**

##5. ライセンス
本ライブラリのライセンスには [MIT License](http://opensource.org/licenses/mit-license.php) を採用しています。

##6. 謝辞
本ライブラリのフォーク元である *scrollsmoothly.js* の作者、KAZUMiX氏に感謝します。  
**[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)**  
Copyright (c) 2008 [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)  
Licensed under the MIT License  