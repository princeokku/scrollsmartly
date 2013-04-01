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
*scrollsmoothly.js* と同様、スクロールした後にURLのハッシュ値を変更しますが、 *scrollsmartly.js* （および、その他のスムーズスクロール系ライブラリ）には、ブラウザで履歴を前後した際に、URLのハッシュとページの表示位置が一致しないという問題がありました。 *scrollsmartly.js* では、履歴の前後に合わせて適切な位置にスクロールすることで、その問題を解決しています。

* ###ページ最上端へのスクロール
href属性が`#`のみである要素、つまり初期のスクロール位置へのページ内リンクには、 *scrollsmoothly.js* ではスクロール機能が適用されませんでしたが、本ライブラリでは適用できるようにしました。  
通常、そのようなリンクをクリックした際には、URLは`#`で終わる、例えば https://github.com/shinnn/scrollsmartly# のようなものになりますが、本ライブラリでは自動的に`#`を取り除き、 https://github.com/shinnn/scrollsmartly のようなハッシュのないURLに整形します。

* ###その他のライブラリに依存しない
jQueryなどの、本ライブラリ以外のJavaScriptライブラリとの依存関係がありません。

##4. API

###プロパティ
* ####`smartly.easing`
型: **Number**  
初期値: **0.25**

* ####`smartly.interval`
型: **Number**  
初期値: **0.25**

* ####`smartly.applyDefault`
型: **Boolean**  
初期値: **true**

* ####`smartly.scrollIn`
型: **Boolean**  
初期値: **true**

* ####`smartly.callback`
型: **Function**  
初期値: **undefined**

* ####`smartly.scrollingTo`
型: **Object (HTMLElement)**  
初期値: **null**

* ####`smartly.scrolledTo`
型: **Object (HTMLElement)**  
初期値: **null**

###メソッド
* ####`smartly.scroll`


* ####`smartly.on`  


* ####`smartly.off`



##5. ライセンス
本ライブラリのライセンスには[MIT License](http://opensource.org/licenses/mit-license.php)を採用しています。
##6. 謝辞
本ライブラリのフォーク元である *scrollsmoothly.js* の作者、KAZUMiX氏に感謝します。  
**[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)**  
Copyright (c) 2008 [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)  
Licensed under the MIT License  
