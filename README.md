#scrollsmartly.js
##概要
[scrollsmoothly.js](http://d.hatena.ne.jp/KAZUMiX/20080418/scrollsmoothly) (Copyright(C) [KAZUMiX](http://d.hatena.ne.jp/KAZUMiX/)) を基に機能の追加、アルゴリズムの改善を行い作成した、Webサイトにページ内スムーズスクロール機能を追加するためのJavaScriptライブラリです。
##基本的な使い方
scrollsmartly.jsはscrollsmoothly.jsと同様に、href属性が`#`で始まる、通常ならページ内リンクとして機能するa要素に自動的にスムーズスクロールを割り当てます。
本ライブラリは、headタグ内などでscrollsmartly.jsファイルを読み込むだけで、その効果をWebページに適用します。
####読み込み方の例
```html
<script src='PATH/scrollsmoothly.js'></script>
```
scrollsmartly.jsの最も基本的な用途、つまり、全てのページ内リンクを内スクロールボタンに置き換えることだけが目的なのであれば、その他にスクリプトを書く必要はありません。

##scrollsmoothlyからの変更点

###"smartly" オブジェクトによる自由なユーザー設定
デフォルト動作、スクロール速度などサイト作成者が変更する際、

###スクロールで「戻る」「進む」

###クロスブラウザ対応のパフォーマンス向上

##scrollsmoothlyから継承した特徴
###jQuery非依存
