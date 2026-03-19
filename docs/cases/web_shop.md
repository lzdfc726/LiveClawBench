case列表：
1 washer-shop 任务：我希望从Mosi Shop上买个洗衣机，【评分达到4.6】且是【portable】的
单环境 + 少步数； tag:easy
2 watch-shop 任务： 我希望从Mosi Shop上买个智能手表，【要求评分达到4.6】且【价格最便宜】
单环境 + 少步数； tag:easy
3 washer-change 任务：已购商品不够便携，换个【评分达到4.6】且【是portable】的洗衣机【退货+订单】
单环境 + 少步数； tag:easy
4 info-change 任务：修改自己的收货地址为“4278 Maple View Drive, Sacramento, CA 95814, USA”，手机号该成“12345678901”
单环境 + 少步数； tag:easy
5 email-watch-shop 任务：读brian.griffin的邮件+从Mosi Shop上买个智能手表，【评分达到4.6】且【价格最便宜】
多环境 + 少步数；tag:mid 
6 email-washer-change 任务：读lois.griffin的邮件+已购商品不够便携，换个评分达到4.6且是portable的洗衣机【退货+订单】
多环境 + 少步数；tag:mid

合成方法：构建虚拟环境(email mock和shop mock) -> 结合openclaw日常使用场景设计测试case，主要设计购物/退货/理解邮件并购物等