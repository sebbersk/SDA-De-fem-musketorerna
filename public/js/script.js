function menu() {
    document.querySelector('.menu').classList.toggle('active');
}


var pagesCustomer = new Vue({
    el: '#pages',
    data: {
        index: 0,
        count: 0,
        track: 0,
    },
    methods: {
        nextButton: function(index) {
          this.index++;
           window.scrollTo(0,0);
        },
        nextButtonCompany: function(count){
        this.count++;
          window.scrollTo(0,0);
        },
        nextButtonTrack: function(track){
          this.track++;
          window.scrollTo(0,0);
        }
      }

    });
