
// Глобальные функции, переменные и т.д.

let url = document.location.href
let token = document.querySelector('[name=csrfmiddlewaretoken]').value

// DOM элементы

let body = document.querySelector('body')
let start_button = document.querySelector('.start')
let quit_button = document.querySelector('.quit')
let prestartQuiz_wrapper = document.querySelector('.prestartQuiz__wrapper')

// --------------

function show_prestartQuiz(){
  let password_wrapper = document.querySelector('.password__wrapper')
  password_wrapper.classList.add('hidden')
  prestartQuiz_wrapper.classList.remove('hidden')
  start_button.classList.remove('hidden')
}

function show_questions(){
  let questions = document.querySelector('.questions')
  questions.classList.remove('hidden')
  start_button.classList.add('hidden')
  prestartQuiz_wrapper.classList.add('hidden')

  questions.style.transform = `translateX(-${parseInt(localStorage.getItem('NUMBER_OF_CURRENT_QUESTION'))-1}00vw)`

  let amount_of_questions = questions.children.length
  questions.style.width = `${amount_of_questions}00vw`
}

function show_result(){
  let result = document.querySelector('.result')
  result.classList.remove('hidden')
}

async function check_what_question(){
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'WHAT-QUESTION': 'TRUE'
    }
  })
  response = await response.text()
  if (response <= document.querySelectorAll('.questions__questionWrapper').length){
    if (localStorage.getItem('NUMBER_OF_CURRENT_QUESTION') != response){
      return response
    }
    console.log(`response: ${response}`)
    return 'wrong'
  } else if (response > document.querySelectorAll('.questions__questionWrapper').length) {
    return 'last_question'
  } else {}
} 

async function get_clients_results(){
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'GET-CLIENTS-RESULTS': 'TRUE'
    }
  })
  response = await response.text()
  return response
}

// ------------------------------------------------------------

// Проверка вводил ли manager пароль (LOGIN: TRUE)
if (localStorage.getItem('LOGIN') == 'TRUE' &&
!localStorage.getItem('RESULT')){
  show_prestartQuiz()
}

// Проверка нажимал ли manager на кнопку "Начать"
if (localStorage.getItem('SHOW_QUESTIONS') == 'TRUE' &&
!localStorage.getItem('RESULT')){
  show_questions()
  check = setInterval(async () => {
    test = await check_what_question()
    if (test == 'last_question'){
      clearInterval(check)
      let questions = document.querySelector('.questions')
      questions.classList.add('hidden')
      check2 = setInterval(async () => {
        test2 = await get_clients_results()
        if (test2 == 'WRONG'){
          return
        } else {
          clearInterval(check2)
          let result = document.querySelector('.result')
          result.outerHTML = test2
          localStorage.setItem('RESULT', body.outerHTML)
          quit_button.classList.remove('hidden')
        }
      }, 1000);
    } else if (test == 'wrong') {
      return
    } else {
      localStorage.setItem('NUMBER_OF_CURRENT_QUESTION', test)
      show_questions()
    }
  }, 1000);
}

// Проверка выводил ли manager результат Quiz
if (localStorage.getItem('RESULT')){
  let password_wrapper = document.querySelector('.password__wrapper')
  password_wrapper.classList.add('hidden')

  quit_button.classList.remove('hidden')

  let result = document.querySelector('.result')
  result.outerHTML = localStorage.getItem('RESULT')
}

// Обработка пароля
let submit_button = document.querySelector('#submit')
let password_input = document.querySelector('#password')

submit_button.addEventListener('click', async (event) => {
  event.preventDefault()

  let password = password_input.value
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'PASSWORD': password
    }
  })
  response = await response.text()
  if (response == 'OK') {
    localStorage.setItem('LOGIN', 'TRUE')
    show_prestartQuiz()
  } else {
    location.reload()
  }
})

// Обработка кнопки 'Reset'
let reset_button = document.querySelector('.prestartQuiz__reset')
reset_button.addEventListener('click', async () => {
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'RESET': 'TRUE'
    }
  })
  response = await response.text()
  if (response == 'OK') {
    localStorage.clear()
    location.reload()
  }
})

// Обработка кнопки "Следующий вопрос"
let next_question_button = document.querySelector('.questions__nextQuestion')
body.addEventListener('click', async (event) => {
  if (event.target.classList.contains('questions__nextQuestion')){
    console.log('CLick')
    let response = await fetch(url, {
      method: 'get',
      headers: {
        'NEXT-QUESTION': 'TRUE',
        'CURRENT-QUESTION': localStorage.getItem('NUMBER_OF_CURRENT_QUESTION')
      }
    })
    response = await response.text()
    if (response == 'OK') {
      console.log('next_question_button OK')
    }
  }
})

// Обработка кнопки 'Выйти'
quit_button.addEventListener('click', async () => {
  localStorage.clear()
  quit_button.style.backgroundColor = 'green'
  location.reload()
})

// Обработка кнопки 'Начать'
start_button.addEventListener('click', async () => {
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'QUIZ-START': 'TRUE'
    }
  })

  response = await response.text()
  if (response == 'OK'){
    localStorage.setItem('SHOW_QUESTIONS', 'TRUE')
    show_questions()
    check = setInterval(async () => {
      test = await check_what_question()
      if (test == 'last_question'){
        clearInterval(check)
        let questions = document.querySelector('.questions')
        questions.classList.add('hidden')
        check2 = setInterval(async () => {
          test2 = await get_clients_results()
          if (test2 == 'WRONG'){
            return
          } else {
            clearInterval(check2)
            let result = document.querySelector('.result')
            result.outerHTML = test2
            localStorage.setItem('RESULT', test2)
            quit_button.classList.remove('hidden')
          }
        }, 1000);
      } else if (test == 'wrong') {
        return
      } else {
        localStorage.setItem('NUMBER_OF_CURRENT_QUESTION', test)
        show_questions()
      }
    }, 1000);
  } else {
    console.log('ERROR (QUIZ-START)')
  }
})

