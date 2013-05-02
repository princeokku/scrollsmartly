#scrollsmartly.js – Smooth Scroll Library for JavaScript

##1. 概要

Webサイトにページ内スムーズスクロール機能を追加するためのJavaScriptライブラリです。単一ページのサイトなどの制作に役立ちます。 *[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)* (Copyright(C) [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)) をフォークし、機能の追加、アルゴリズムの改善を行ったものです。

##2. 基本的な使い方

`smartly.all`メソッドを呼び出すことで、href属性が`#`で始まる、通常はページ内リンクとして機能するa要素全てに対し自動的にスムーズスクロール機能を上書きします。

####読み込み方の例

```html
<script src='PATH/scrollsmartly.js'></script>
<script>
  smartly.all();
</script>
```

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

* ####`smartly.scrollingTo`
型: **Object (HTMLElement)**  
初期値: **null**  
現在のスクロール先要素です。`smartly.scroll`メソッドが実行された際に、最終的なスクロール先となる要素が本プロパティに代入されます。  
スクロールが完了したときに初期値である`null`が再度代入されます。スクロール中であるかどうかを判別したい場合は、下記のように処理します。
す。
```js
if(smartly.scrolingTo !== null){
  //スクロール中であれば行う処理
}
```

* ####`smartly.scrolledTo`
型: **Object (HTMLElement)**  
初期値: **null**  
直前のスクロールで到達した要素です。`smartly.scroll`メソッドによるスクロールが完了した直後に、その際のスクロール先だった要素が代入されます。

* ####`smartly.homeElement`
型: **Object (HTMLElement)**  
初期値: **html 要素**  
目標要素が指定されていないスクロールは、全てこの要素へのスクロールとなります。

* ####`smartly.viewpoint.keyword`
型: **Stirng**  
初期値: **'left top'**  
到達地点の座標を設定します。

* ####`smartly.viewpoint.x`, `smartly.viewpoint.y`
型: **Stirng**  
初期値: **'left top'**  
到達地点の座標を設定します。

###メソッド

* ####`smartly.all()`
全てのページ内リンクのデフォルト動作を無効 (
`event.preventDefault`と`event.stopPropagation`を実行）にし、代わりに、本来のリンク先であるアンカーへのスムーズスクロールを起動するボタンにします。

    * #####引数: なし
    
    * #####戻り値: *(Object) smartly*

* ####`smartly.scroll([via1, ] [via2, … ] [to, ] [callback])`, `smartly.scroll([properties])`
指定した要素へのスクロールを行います。経由する要素や、スクロールが完了した際に実行するコールバック関数を指定できます。

    * #####引数: *via*
    
    * #####戻り値: *(Object) smartly*

* ####`smartly.delay([function, ] [milliSeconds])`
指定したid属性を持つ要素へのスクロールを行います。

   * #####引数1: *milliSeconds*  
   

* ####`smartly.on(element [, id])`
指定した要素のクリックイベントに、`smartly.scroll`メソッドをイベントリスナーとして登録します。
引数1: **element**  
引数2: **hash**

* ####`smartly.off(element)`
指定した要素のクリックイベントに紐付いている`smartly.scroll`メソッドを取り除きます。  
引数1: **element**

###イベント

* ####`smartlystart`
型: **Object (HTMLEvent)**  
`smartly.scroll`メソッドが実行され、スクロールが始まる直前に発生します。

* ####`smartlyend`
型: **Object (HTMLEvent)**  
`smartly.scroll`メソッドが実行され、スクロールが目標に到達した直後に発生します。

##5. ライセンス

本ライブラリのライセンスには [MIT License](http://opensource.org/licenses/mit-license.php) を採用しています。

##6. 謝辞

本ライブラリのフォーク元である *scrollsmoothly.js* の作者、KAZUMiX氏に感謝します。

**[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)**  
Copyright (c) 2008 [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)  
Licensed under the MIT License  