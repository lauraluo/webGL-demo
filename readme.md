
# 內容

一些素材來源待補

## 聲音API

[DEMO](http://lauraluo.github.io/webGL-demo/audio.html)

![圖](http://lauraluo.github.io/webGL-demo/images/audio.gif?v=2)

## 圖片轉粒子

[DEMO](http://lauraluo.github.io/webGL-demo/particle.html)

![圖](http://lauraluo.github.io/webGL-demo/images/pr.gif?v=2)

## 3D物件導入

[DEMO](http://lauraluo.github.io/webGL-demo/import)

![圖](http://lauraluo.github.io/webGL-demo/images/import.gif?v=2)

## MMD導入
![圖](http://lauraluo.github.io/webGL-demo/images/mmd.gif?v=2)

## 360影片forIE11-使用valiant.jquery
![圖](http://lauraluo.github.io/webGL-demo/images/360.gif?v=2)


```flow
st=>start: 页面加载
e=>end: End:>http://www.google.com
op1=>operation: get_hotel_ids|past
op2=>operation: get_proxy|current
sub1=>subroutine: get_proxy|current
op3=>operation: save_comment|current
op4=>operation: set_sentiment|current
op5=>operation: set_record|current

cond1=>condition: ids_remain空?
cond2=>condition: proxy_list空?
cond3=>condition: ids_got空?
cond4=>condition: 爬取成功??
cond5=>condition: ids_remain空?

io1=>inputoutput: ids-remain
io2=>inputoutput: proxy_list
io3=>inputoutput: ids-got

st->op1(right)->io1->cond1
cond1(yes)->sub1->io2->cond2
cond2(no)->op3
cond2(yes)->sub1
cond1(no)->op3->cond4
cond4(yes)->io3->cond3
cond4(no)->io1
cond3(no)->op4
cond3(yes, right)->cond5
cond5(yes)->op5
cond5(no)->cond3
op5->e

```
