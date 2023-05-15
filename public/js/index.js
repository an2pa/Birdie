let mybutton = $("#btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
scrollFunction();
};

function scrollFunction() {
if (
document.body.scrollTop > 20 ||
document.documentElement.scrollTop > 20
) {
    $("#btn-back-to-top").css("display","block")
} else {
    $("#btn-back-to-top").css("display","none")
}
}
// When the user clicks on the button, scroll to the top of the document
$("#btn-back-to-top").click(function(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

let pasta=document.getElementById("pasta")


/*--------------------------------------------*/
