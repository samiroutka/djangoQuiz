from django.shortcuts import render
from django.views.generic.base import View
from django.http import HttpResponse
from .models import client
from questions.models import questions
from djangoSite.settings import *
import json
import time

# Общие сущности (функции, переменные и т.д.)
MANAGER_LOGIN = False
QUIZ_START = False

PASSWORD = 'godisgoodgodisgreat'
TEST_RIGHT_ANSWERS = 0

# -----------------------------------------

# Client
class clientView(View):
  def get(self, request):
    global MANAGER_LOGIN
    global QUIZ_START
    # Проверяет залогинился ли manager
    if ( MANAGER_LOGIN and not(request.headers.get('GET-QUIZ-START')) and
    not(request.headers.get('ANSWERED-OR-NOT') == 'TRUE') and
    not(request.headers.get('CHECK-ANSWERS'))):
      question_objects = questions.objects.order_by('number_of_question')
      correct_answers = []
      for object in question_objects:
        if (object.number_of_correct_answer == 1):
          object.correct_answer = object.answer1
          correct_answers.append(object.answer1)
        elif (object.number_of_correct_answer == 2):
          object.correct_answer = object.answer2
        else:
          object.correct_answer = object.answer3
      return render(request, 'quiz/templates/client.html', {
        'question_objects': question_objects,
      })
    # Отдает ответ на проверку "Начался ли Quiz" 
    elif (request.headers.get('GET-QUIZ-START') == 'TRUE'):
      if (QUIZ_START):
        return HttpResponse('OK')
      elif (not(MANAGER_LOGIN)):
        return HttpResponse('MANAGER_LOGIN-FALSE')
      else: 
        return HttpResponse('WRONG')
    # Проверяет answered_or_not у текущего вопроса
    elif (request.headers.get('ANSWERED-OR-NOT') == 'TRUE'):
      current_question = questions.objects.get(number_of_question=request.headers.get('NUMBER-OF-CURRENT-QUESTION'))
      if (current_question.answered_or_not):
        # Меняем все current_answer на False
        for user in client.objects.all():
          user.current_answer = False
          user.save()
        return HttpResponse('OK')
      else:
        return HttpResponse('WRONG')
    # Отправка ответа на проверку запущен ли Quiz у client_managerNotReady.html
    elif (request.headers.get('CHECK-QUIZ-START') == 'TRUE'):
      if (QUIZ_START):
        return render(request, 'quiz/templates/client.html', {})
      else:
        return HttpResponse('WRONG')
    else:
      return render(request, 'quiz/templates/client_managerNotReady.html', {})

  def post(self, request):
    global TEST_RIGHT_ANSWERS
    # Загружает в базу login участника
    if (request.headers.get('LOGIN') == 'TRUE' and not(QUIZ_START)):
      if (MANAGER_LOGIN):
        login = json.loads(request.body)['LOGIN']
        all_users = client.objects.all()
        for user in all_users:
          if (user.nickname == login):
            return HttpResponse('EXISTING-LOGIN')
        client.objects.create(nickname = login)
        return HttpResponse('OK')
      else:
        return HttpResponse('MANAGER_LOGIN-FALSE')
    elif (request.headers.get('CURRENT-ANSWER') == 'TRUE'):
      # Меняет current_answer на True
      login = json.loads(request.body)['NICKNAME']
      user = client.objects.get(nickname=login)
      user.current_answer = True
      user.save()
      # Проверяет все ли ответили на текущий вопрос (меняет answered_or_not)
      if (client.objects.order_by('current_answer')[0].current_answer):
        number_of_current_question = request.headers.get('NUMBER-OF-CURRENT-QUESTION')
        current_question = questions.objects.get(number_of_question=number_of_current_question)
        current_question.answered_or_not = True
        current_question.save()
      return HttpResponse('OK')
    elif (request.headers.get('CHECK-ANSWERS') == 'TRUE'):
      # Проверяем насколько правильны ответы участника
      client_answers = request.headers.get('ANSWERS').split(',')
      # Преобразовывает массив client_answers
      index = 0
      for element in client_answers:
        client_answers[index] = int(element)
        index+=1
      # Преобразовывает массив right_answers
      right_answers = []
      for object in questions.objects.order_by('number_of_question'):
        right_answers.append(object.number_of_correct_answer)
      # Проверка ответов
      result = []
      points = 0
      index2 = 0
      for answer in client_answers:
        if (client_answers[index2] == right_answers[index2]):
          result.append(True)
          points+=1
        else:
          result.append(False)
        index2+=1
      # Изменение client.right_answers
      nick = json.loads(request.body)['NICKNAME']
      user = client.objects.get(nickname=nick)
      user.right_answers = points
      user.save()
      TEST_RIGHT_ANSWERS+=1
      result = str(result).replace(' ', '')[1:-1]
      return HttpResponse(result)
    else:
      return HttpResponse('WRONG')

# -----------------------------------------

# Manager
class managerView(View):
  def get(self, request):
    global MANAGER_LOGIN
    global QUIZ_START
    global TEST_RIGHT_ANSWERS
    # Проверка пароля
    if (request.headers.get('PASSWORD') == PASSWORD):
      MANAGER_LOGIN = True
      return HttpResponse('OK')
    # Преводить все переменные и баззу данных к исходному виду
    elif (request.headers.get('RESET') == 'TRUE'):
      for question in list(questions.objects.all()):
        question.answered_or_not = False
        question.save()
      client.objects.all().delete()
      MANAGER_LOGIN = False
      QUIZ_START = False
      TEST_RIGHT_ANSWERS = 0
      return HttpResponse('OK')
    # Проверка начался ли Quiz или нет
    elif (request.headers.get('QUIZ-START') == 'TRUE'):
      QUIZ_START = True
      return HttpResponse('OK')
    # Проверка какой сейчас вопрос
    elif (request.headers.get('WHAT-QUESTION') == 'TRUE'):
      all_questions = list(questions.objects.order_by('number_of_question'))
      number_of_current_question = 1
      for question in all_questions:
        if (question.answered_or_not):
          number_of_current_question+=1
      return HttpResponse(number_of_current_question)
    # Возвращение результатов Quiz
    elif (request.headers.get('GET-CLIENTS-RESULTS') == 'TRUE'):
      if (TEST_RIGHT_ANSWERS == len( list( client.objects.all() ) ) ):
        users = list(client.objects.order_by('right_answers'))
        users.reverse()
        # Преводить все переменные и баззу данных к исходному виду
        for question in list(questions.objects.all()):
          question.answered_or_not = False
          question.save()
        client.objects.all().delete()
        MANAGER_LOGIN = False
        QUIZ_START = False
        TEST_RIGHT_ANSWERS = 0
        # ----------------
        return render(request, 'quiz/templates/manager_result.html', {
          'users': users,
        })
      else:
        return HttpResponse('WRONG')
    elif (request.headers.get('NEXT-QUESTION') == 'TRUE'):
      number_of_current_question = int(request.headers.get('CURRENT-QUESTION'))
      for user in list(client.objects.all()):
        if (user.current_answer == False):
          user.delete()
      current_question = questions.objects.get(number_of_question=number_of_current_question)
      current_question.answered_or_not = True
      current_question.save()
      return HttpResponse('OK')
    else:
      client_objects = list(client.objects.all())
      question_objects = questions.objects.order_by('number_of_question')
      return render(request, 'quiz/templates/manager.html', {
        'client_objects': client_objects,
        'question_objects': question_objects
      })