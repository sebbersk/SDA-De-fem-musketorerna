
var vm= new Vue({
  el: '.box',
  data:{
    messages:[]
    },
    methods:{
      saveMes: function(){
      this.messages.push(getContactInfo());
    }
  }
})
