function menu() {
    document.querySelector('.menu').classList.toggle('active');
}

var pages = new Vue({
    el: '#pages',
    data: {
        index: 0,
    }
})