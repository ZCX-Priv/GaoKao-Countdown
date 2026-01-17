(function(GaoKao) {
    'use strict';

    GaoKao.QuoteManager = class QuoteManager {
        constructor() {
            this.contentEl = document.getElementById('quote-content');
            this.authorEl = document.getElementById('quote-author');
            this.intervalId = null;
            this.currentTypes = [];
        }

        load(types = []) {
            this.currentTypes = Array.isArray(types) ? types : [];
            this.startInterval();
            return this.fetchQuote();
        }

        startInterval() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            this.intervalId = setInterval(() => {
                this.fetchQuote();
            }, 30000);
        }

        stopInterval() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }

        fetchQuote() {
            let url = 'https://v1.hitokoto.cn/?encode=json';
            if (this.currentTypes.length > 0) {
                this.currentTypes.forEach(t => {
                    url += `&c=${t}`;
                });
            }
            return new Promise((resolve) => {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.hitokoto) {
                            this.contentEl.textContent = data.hitokoto;
                            const author = data.from || data.from_who || data.creator;
                            this.authorEl.textContent = author && author !== '无' ? `—— ${author}` : '—— 匿名';
                        } else {
                            this.showLocalQuote();
                        }
                        resolve();
                    })
                    .catch(() => {
                        this.showLocalQuote();
                        resolve();
                    });
            });
        }

        showLocalQuote() {
            const quotes = [
                { content: "星光不问赶路人，时光不负有心人。", author: "佚名" },
                { content: "乾坤未定，你我皆是黑马。", author: "佚名" },
                { content: "海阔凭鱼跃，天高任鸟飞。", author: "古诗" },
                { content: "读书破万卷，下笔如有神。", author: "杜甫" },
                { content: "既然选择了远方，便只顾风雨兼程。", author: "汪国真" },
                { content: "十年寒窗无人问，一举成名天下知。", author: "高明" },
                { content: "有志者，事竟成，破釜沉舟，百二秦关终属楚。", author: "蒲松龄" },
                { content: "苦心人，天不负，卧薪尝胆，三千越甲可吞吴。", author: "蒲松龄" },
                { content: "只有经过地狱般的磨练，才能拥有创造天堂的力量。", author: "泰戈尔" },
                { content: "没有白走的路，每一步都算数。", author: "李宗盛" },
                { content: "我命由我不由天。", author: "哪吒" },
                { content: "人活着就没有退路，多想也无益，只管往前走。", author: "银魂" }
            ];

            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            this.contentEl.textContent = randomQuote.content;
            this.authorEl.textContent = `—— ${randomQuote.author}`;
        }
    };

})(window.GaoKao = window.GaoKao || {});
