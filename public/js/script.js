function menu() {
    document.querySelector('.menu').classList.toggle('active');
}

var pages = new Vue({
    el: '#pages',
    data: {
        index: 0,
    },
    methods: {
        nextButton: function() {
            this.index++;
            window.scrollTo(0,0);
        },
    }
})