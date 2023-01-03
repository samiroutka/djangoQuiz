// Глобальные функции, переменные и т.д.

let body = document.querySelector('body')
let url = document.location.href
let token = document.querySelector('[name=csrfmiddlewaretoken]').value

let answers_of_client
function show_wait_page(){
  let login_wrapper = document.querySelector('.login__wrapper')
  let wait_wrapper = document.querySelector('.wait__wrapper')
  login_wrapper.classList.add('hidden')
  wait_wrapper.classList.remove('hidden')
}

function show_questions(){
  let login_wrapper = document.querySelector('.login__wrapper')
  let wait_wrapper = document.querySelector('.wait__wrapper')
  if (!login_wrapper.classList.contains('hidden')){
    login_wrapper.classList.add('hidden')
  }

  if (!wait_wrapper.classList.contains('hidden')){
    wait_wrapper.classList.add('hidden')
  }

  let wait_wrapper2 = document.querySelector('.wait__wrapper2')
  if (!wait_wrapper2.classList.contains('hidden')){
    wait_wrapper2.classList.add('hidden')
  }

  let questions = document.querySelector('.questions')

  if (localStorage.getItem('NUMBER_OF_CURRENT_QUESTION')){
    number_of_current_question = localStorage.getItem('NUMBER_OF_CURRENT_QUESTION')
    questions.style.transform = `translateX(-${number_of_current_question-1}00vw)`
  }

  questions.classList.remove('hidden')

  let amount_of_questions = questions.children.length
  questions.style.width = `${amount_of_questions}00vw`

  do_notClickable_buttons_sendAnswer()
}

function show_result_wait(){
  let login_wrapper = document.querySelector('.login__wrapper')
  if (!login_wrapper.classList.contains('hidden')){
    login_wrapper.classList.add('hidden')
  }

  let wait_wrapper2 = document.querySelector('.wait__wrapper2')
  wait_wrapper2.classList.add('hidden')
  localStorage.setItem('RESULT_WAIT', 'TRUE')
  let result_wait = document.querySelector('.result__wait')
  result_wait.classList.remove('hidden')
}

function show_result(answers){
  let result_result = document.querySelectorAll('.result__result')
  index = 0
  for (element of result_result){
    if (answers[index] == 'True'){
      element.classList.add('correct')
    } else {
      element.classList.add('wrong')
    }
    index+=1
  }

  let result_mainPage = document.querySelector('.result__mainPage')
  result_mainPage.classList.remove('hidden')
}

function hide_result_wait(){
  let result_wait = document.querySelector('.result__wait')
  result_wait.classList.add('hidden')
}

function show_next_question(){
  let questions = document.querySelector('.questions')
  // Проверка последний ли это вопрос
  if (parseInt(localStorage.getItem('NUMBER_OF_CURRENT_QUESTION')) == questions.children.length) {
    return 'last_question'
  } else {
    number_of_current_question = parseInt(localStorage.getItem('NUMBER_OF_CURRENT_QUESTION'))
    number_of_current_question+=1
    localStorage.setItem('NUMBER_OF_CURRENT_QUESTION', number_of_current_question)

    let wait_wrapper2 = document.querySelector('.wait__wrapper2')
    wait_wrapper2.classList.add('hidden')
    questions.style.transform = `translateX(-${number_of_current_question-1}00vw)`
    questions.classList.remove('hidden')

    let amount_of_questions = questions.children.length
    questions.style.width = `${amount_of_questions}00vw`

    do_notClickable_buttons_sendAnswer()
  }
}

function show_waitWrapper2(){
  let login_wrapper = document.querySelector('.login__wrapper')
  if (!login_wrapper.classList.contains('hidden')){
    login_wrapper.classList.add('hidden')
  }

  let questions = document.querySelector('.questions')
  let wait_wrapper2 = document.querySelector('.wait__wrapper2')
  questions.classList.add('hidden')
  wait_wrapper2.classList.remove('hidden')
}

async function check_answers(){
  // Проверяем на сервере насколько правильны ответы участника
  let response = await fetch(url, {
    method: 'post',
    headers: {
      'X-CSRFToken': token,
      'CHECK-ANSWERS': 'TRUE',
      'ANSWERS': localStorage.getItem('answers_of_client'),
    },
    body: JSON.stringify({
      'NICKNAME': localStorage.getItem('NICKNAME')
    })
  })
  response = await response.text()
  if (response != 'WRONG'){
    result = response.split(',')
    return result
  }
}

function get_client_answers(){
  if (localStorage.getItem('answers_of_client')){
    answers_of_client = localStorage.getItem('answers_of_client').split(',')
  } else {
    answers_of_client = []
  }
}

async function check_QUIZ_START(){
  console.log('Checking...')
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'GET-QUIZ-START': 'TRUE'
    }
  })
  response = await response.text()
  if (response == 'OK'){
    localStorage.setItem('QUESTIONS', 'TRUE')
    show_questions()
  } else if (response == 'MANAGER_LOGIN-FALSE') {
    localStorage.clear()
    location.reload()
  } else if (response == 'WRONG') {
    setTimeout(() => {
      console.log('Wrong')
      check_QUIZ_START()
    }, 2000);
  } else {
    console.log('ERROR (checking is wrong)')
  }
}

async function change_CURRENT_ANSWER(number_of_current_question){
  let response = await fetch(url, {
    method: 'post',
    headers: {
      'X-CSRFToken': token,
      'CURRENT-ANSWER': 'TRUE',
      'NUMBER-OF-CURRENT-QUESTION': number_of_current_question
    },
    body: JSON.stringify({
      'NICKNAME': localStorage.getItem('NICKNAME')
    })
  })
  response = await response.text()
  if (response == 'OK'){
    return 'OK'
  }
}

async function check_ANSWERED_OR_NOT(){
  console.log('Checking (answered_or_not) ...')
  let response = await fetch(url, {
    method: 'get',
    headers: {
      'ANSWERED-OR-NOT': 'TRUE',
      'NUMBER-OF-CURRENT-QUESTION': localStorage.getItem('NUMBER_OF_CURRENT_QUESTION')
    }
  })
  response = await response.text()
  if (response == 'OK') {
    console.log('ВСЕ ОТВЕТИЛИ НА ВОПРОС')
    return 'OK'
  } else {
    console.log('WRONG')
    return 'WRONG'
  }
}

function do_notClickable_buttons_sendAnswer(){
  let answer_buttons = document.querySelectorAll('.questions__sendAnswer')
  for (button of answer_buttons){
    button.disabled = true
  } 
  setTimeout(() => {
    for (button of answer_buttons){
      button.disabled = false
    }
  }, 3000);
}

// ----------------------------------------------------

// Обработка ответов клиента
get_client_answers()

// Проверка вводил ли пользователь login
if (localStorage.getItem('CLIENT_LOGIN') == 'TRUE' && 
localStorage.getItem('QUESTIONS') != 'TRUE'){
  show_wait_page()
  check_QUIZ_START()
}

// Проверка переходил ли пользователь на вопросы
if (localStorage.getItem('QUESTIONS') == 'TRUE' &&
localStorage.getItem('WAIT') != 'TRUE' &&
localStorage.getItem('RESULT_WAIT') != 'TRUE'){
  show_questions()
}

// Проверка ждёт ли пользователь других
if (localStorage.getItem('WAIT') == 'TRUE'){
  async function function1(){
    check = await setInterval(async () => {
      if (await check_ANSWERED_OR_NOT() == 'WRONG'){
        return
      } else {
        clearInterval(check)
        localStorage.setItem('WAIT', 'FALSE')
        if (show_next_question() == 'last_question'){
          show_result_wait()
          show_result(await check_answers())
          hide_result_wait()
          localStorage.clear()
        }
      }
    }, 2000);
  }

  show_waitWrapper2()
  function1()
}

// Проверка ждёт ли пользователь своих результатов
if (localStorage.getItem('RESULT_WAIT') == 'TRUE'){
  show_result_wait()
}

// Обработка login
let submit_button = document.querySelector('.login__submit')

submit_button.addEventListener('click', async (event) => {
  event.preventDefault()

  let login = document.querySelector('#login').value
  if (login != ''){
    let response = await fetch(url, {
      method: 'post',
      headers: {
        'X-CSRFToken': token,
        'LOGIN': 'TRUE'
      },
      body: JSON.stringify({
        'LOGIN': login
      })
    }) 
    response = await response.text()
    if (response == 'OK'){
      localStorage.setItem('CLIENT_LOGIN', 'TRUE')
      localStorage.setItem('NICKNAME', login)
      show_wait_page()
      // Проверка начался ли Quiz или нет 
      check_QUIZ_START()
    } else if (response == 'MANAGER_LOGIN-FALSE'){
      localStorage.clear()
      location.reload()
    } else {
      location.reload()
    }
  }
})

// Обработка СТИЛИСТИКИ ответов на вопросы
body.addEventListener('click', (event) => {
  if (event.target.classList.contains('questions__answer')) {
    for (element of event.target.parentElement.children) {
      element.classList.remove('selected')
    }
    event.target.classList.add('selected')
  }
})

// Обработка кнопки "Ответить" (ответ на вопрос)
body.addEventListener('click', async (event) => {
  if (event.target.classList.contains('questions__sendAnswer')) {
    if (event.target.parentElement.querySelector('.selected')) { // Если у нас есть выбранный элемент
      let number_of_current_question = event.target.parentElement.querySelector('.questions__numberOfQuestion').children[0].textContent
      localStorage.setItem('NUMBER_OF_CURRENT_QUESTION', number_of_current_question)
      // Сохраняет ответы клиента
      answers_of_client.push(parseInt(event.target.parentElement.querySelector('.selected').id))
      localStorage.setItem('answers_of_client', answers_of_client)
      get_client_answers()
      console.log(answers_of_client)
      // Выводить wait__wrapper2 (подождите пока все участники ответят на вопрос)
      localStorage.setItem('WAIT', 'TRUE')
      show_waitWrapper2()
      // Меняет поле "current_answer" на True
      await change_CURRENT_ANSWER(number_of_current_question)
      // Проверяем ответили ли все на текущий вопрос
      check = await setInterval(async () => {
        if (await check_ANSWERED_OR_NOT() == 'WRONG'){
          return
        } else {
          clearInterval(check)
          localStorage.setItem('WAIT', 'FALSE')
          if (show_next_question() == 'last_question'){
            show_result_wait()
            show_result(await check_answers())
            hide_result_wait()
            localStorage.clear()
          }
        }
      }, 2000);
    } else {}
  }
})



