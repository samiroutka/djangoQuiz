
let url = document.location.href

async function check_quiz_start(){
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'CHECK-QUIZ-START': 'TRUE'
    }
  })
  response = await response.text()
  if (response == 'WRONG') {
    setTimeout(() => {
      check_quiz_start()
    }, 2000);
  } else {
    location.reload()
  }
}

// ----------------------------------------------------------------------

localStorage.clear()

// Стилистика client_managerNotReady.html span
let spans = document.querySelectorAll('span')

setTimeout(() => {
  spans[0].style.animation = 'span_anim infinite 1.5s linear'
  setTimeout(() => {
    spans[1].style.animation = 'span_anim infinite 1.5s linear'
  }, 300)
  setTimeout(() => {
    spans[2].style.animation = 'span_anim infinite 1.5s linear'
  }, 600)
}, 1500);

// Проверяет начался ли quiz
check_quiz_start()
