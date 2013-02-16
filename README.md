#scrollsmartly.js
##概要
Webサイトにページ内スムーズスクロール機能を追加するためのJavaScriptライブラリです。単一ページのサイトなどの制作に役立ちます。 *[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)* (Copyright(C) [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)) をフォークし、機能の追加、アルゴリズムの改善を行ったものです。
##基本的な使い方
headタグ内などで`scrollsmartly.js`ファイルを読み込むだけで、href属性が`#`で始まる、通常はページ内リンクとして機能するa要素全てに対し自動的にスムーズスクロール機能を上書きします。
####読み込み方の例
```html
<script src='PATH/scrollsmartly.js'></script>
```
後述する *scrollsmartly.js* のその他の機能を使わない場合であれば、上記以外のスクリプトを書く必要はありません。

##scrollsmoothly.jsからの変更点
* ###"smartly" オブジェクトによる自由なユーザー設定
ライブラリの読み込みと同時に生成される`smartly`オブジェクトのプロパティおよびメソッドを用いて、デフォルト動作、スクロール速度などをサイト作成者が変更できます。

* ###スクロールで「戻る」「進む」
*scrollsmartly.js* （および、その他のスムーズスクロール系ライブラリ）には、ブラウザで履歴を前後した際に、URLのハッシュとページの表示位置が一致しないという問題がありました。
*scrollsmartly.js* では、履歴の前後に合わせて適切な位置にスクロールすることで、その問題を解決しています。

* ###クロスブラウザ対応のパフォーマンス向上
メソッドの有無など、ブラウザ判定を行う頻度をできるだけ少なくするよう改善しました。

##ライセンス
本ライブラリのライセンスには[MIT License](http://opensource.org/licenses/mit-license.php)を採用しています。
##謝辞
本ライブラリのフォーク元である *scrollsmoothly.js* の作者、KAZUMiX氏に感謝します。  
**[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly)**  
Copyright (c) 2008 [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)  
Licensed under the MIT License  
