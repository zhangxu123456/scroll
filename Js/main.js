/**
 * Created by Administrator on 2017/2/10.
 */
(function (win,doc,$) {
    function CusScrollBar(options){
        this._init(options);

    }
    // CusScrollBar.prototype._init= function () {};
    // 下面使用$.extend 合并 将_init方法合并到CusScrollBar.prototype
    $.extend(CusScrollBar.prototype,{
        _init: function (options) {
            var self=this;
            self.options={
                scrollDir     :  "y", //滚动方向
                contSelector  :  "",  //滚动内容区选择器
                barSelector   :  "",  //滚动条选择器
                sliderSelector:  "",  //滚动滑块选择器
                tabItemSelector:  ".tab-item", //标签选择器
                tabActiveClass:  "tab-active",//选择标签类名
                anchorSelector: ".anchor",    //锚点选择器
                wheelStep     :  10,   //滚动步长
                correctSelector: ".correct-bot",
                articleSelector: ".scroll-ol"
            };
            $.extend(true,self.options,options || {});
            self._initDomEvent();

            return self;
        },
        _initDomEvent: function () {
            var opts=this.options;
            //滚动内容区对象，必填项
            this.$cont=$(opts.contSelector);
            //滚动条滑块对象，必填项
            this.$slider=$(opts.sliderSelector);
            //滚动对象
            this.$bar=opts.barSelector ? $(opts.barSelector) : self.$slider.parent();
            //标签项
            this.$tabItem=$(opts.tabItemSelector);
            //锚点项
            this.$anchor=$(opts.anchorSelector);
            //正文
            this.$article=$(opts.articleSelector);
            //校正元素对象
            this.$correct=$(opts.correctSelector);
            //获取文档对象
            this.$doc=$(doc);
            this._initSliderDragEvent()._initTabEvent()._bindContScroll()._bindMousewheel()._initArticleHeight();
        },
        /*初始化文档高度*/
        _initArticleHeight: function () {
            var self=this,
                lastArticle=self.$article.last();
            var lastArticleHeight=lastArticle.height(),
                contHeight=self.$cont.height();
            if(lastArticleHeight<contHeight){
                self.$correct[0].style.height=contHeight-lastArticleHeight-self.$anchor.outerHeight()+"px";
            }
            return self;
        },
        /*
         * 初始化滑块拖动功能
         * */
        _initSliderDragEvent: function () {
            var self=this,
                slider=self.$slider,
                sliderEl=slider[0];
            if(sliderEl){
                var doc=self.$doc,
                    dragStartPagePosition,
                    dragStartScrollPosition,
                    dragContBarRate;
                    function mousemoveHandler(e){
                    e.preventDefault();
                    console.log("mousemove");
                    if(dragStartPagePosition==null){
                        return;
                    }
                    self.scrollTo(dragStartScrollPosition+(e.pageY - dragStartPagePosition)*dragContBarRate);
                }
                slider.on("mousedown", function (e) {

                    e.preventDefault();
                    dragStartPagePosition= e.pageY;
                    dragStartScrollPosition=self.$cont[0].scrollTop;
                    dragContBarRate=self.getMaxScrollPosition()/self.getMaxSliderPosition();
                    doc.on("mousemove.scroll",mousemoveHandler)
                        .on("mouseup.scroll", function (e) {
                            console.log("mouseup");
                            doc.off(".scroll"); //关于on的命名空间
                        });

                });
            }
            return self;
        },
        /*初始化标签切换功能*/
        _initTabEvent: function () {
            var self=this;
            self.$tabItem.on("click",function(e){
                e.preventDefault();
                var index=$(this).index();
                self.changeTabSelect(index);
                //已经滚出可视区的内容高度
                //指定锚点与内容容器的距离
                self.scrollTo(self.$cont[0].scrollTop+self.getAnchorPosition(index))
            });
            return self;
        },
        //切换标签的选中
        changeTabSelect : function (index) {
            var self=this,
                active=self.options.tabActiveClass;
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
        },
        //获取指定锚点到上边界的像素数
        getAnchorPosition: function (index) {
            console.log(index);
            return this.$anchor.eq(index).position().top;
        },
        //获取每个锚点位置信息的数组
        getAllAnchorPosition : function () {
            var self=this,
                allPositionArr=[];
            for(var i=0;i < self.$anchor.length;i++){
                allPositionArr.push(self.$cont[0].scrollTop+self.getAnchorPosition(i));
            }
            console.log(allPositionArr);
            return allPositionArr;
        },
        _bindContScroll: function () {
            var self=this;
            self.$cont.on("scroll", function () {
                var sliderEl=self.$slider && self.$slider[0];
                if(sliderEl){
                    sliderEl.style.top=self.getSliderPosition()+"px";
                }
            });
            return self;
        },
        _bindMousewheel: function () {
            var self=this;
            self.$cont.on("mousewheel DOMMouseScroll",
                function (e) {
                    e.preventDefault();
                    var oEv= e.originalEvent,
                        wheelRange=oEv.wheelDelta ? -oEv.wheelDelta/120 : (oEv.detail || 0)/3;


                    self.scrollTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
                });
            return self;
        },
        //计算滑块当前的位置
        getSliderPosition : function () {
            var self=this,
                maxSliderPosition=self.getMaxSliderPosition();
            return Math.min(maxSliderPosition,maxSliderPosition*self.$cont[0].scrollTop/self.getMaxScrollPosition());
            //卷入部分/文档可卷入高度=滑动部分/可滑动部分
        },
        //内容可滚动高度
        getMaxScrollPosition: function () {
            var self=this;
            return Math.max(self.$cont.height(),self.$cont[0].scrollHeight)-self.$cont.height();
        },
        //滑块可滚动高度
        getMaxSliderPosition: function () {
            var self=this;
            return self.$bar.height() - self.$slider.height();
        },
        scrollTo: function (positionVal) {
            var self=this;
            var posArr=self.getAllAnchorPosition();
            console.log(posArr);
            //滚动条的位置与tab标签的对应
            function getIndex(positionVal){
                for(var i=posArr.length-1;i >= 0;i--){
                    if(positionVal >= posArr[i]){
                        return i;
                    }else{
                        continue;
                    }
                };
            }
            //锚点树与表前述相同
            if(posArr.length==self.$tabItem.length){
                self.changeTabSelect(getIndex(positionVal));
            }
            self.$cont.scrollTop(positionVal);
        }
    });


    win.CusScrollBar=CusScrollBar;
})(window,document,jQuery);
var CusScrollBars= new window.CusScrollBar({
    contSelector   : ".scroll-cont", //滚动内容区选择器
    barSelector    : ".scroll-bar",  //滚动条选择器
    sliderSelector : ".scroll-slider" //滚动滑块
});