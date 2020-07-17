const navPopup = document.querySelector(".nav__wrapper-itemsContent");
const burger = document.querySelector(".burger");
const burger_1 = document.querySelector(".burger__1");
const burger_2 = document.querySelector(".burger__2");
const burger_3 = document.querySelector(".burger__3");
const body = document.querySelector("body");

burger.onclick = function (event) {
  if (!navPopup.classList.contains("nav__wrapper-active")) {
    navPopup.classList.add("nav__wrapper-active");
    burger_1.classList.add("burger__1-active");
    burger_2.classList.add("burger__2-active");
    burger_3.classList.add("burger__3-active");
    body.classList.add("scrollLock");
  } else {
    navPopup.classList.remove("nav__wrapper-active");
    burger_1.classList.remove("burger__1-active");
    burger_2.classList.remove("burger__2-active");
    burger_3.classList.remove("burger__3-active");
    body.classList.remove("scrollLock");
  }
};
