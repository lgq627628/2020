class Meal {
    c = 1
    pay() {}
  
    eat() {}
  }
  
  var dinner = new Meal();
  dinner.a = 1;
  for (var key in dinner) {
    console.log(key);
    // "eat" only, not "pay"
  }