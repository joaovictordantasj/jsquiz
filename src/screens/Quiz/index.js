/* eslint-disable react/prop-types */
import React from 'react';
// import useWindowSize from 'react-use/lib/useWindowSize';
// import Confetti from 'react-confetti';
// import db from '../../../db.json';
import Button from '../../components/Button';
import Widget from '../../components/Widget';
import QuizLogo from '../../components/QuizLogo';
import BackLinkArrow from '../../components/BackLinkArrow';
import QuizContainer from '../../components/QuizContainer';
import QuizBackground from '../../components/QuizBackground';
import AlternativesForm from '../../components/AlternativesForm';

function ResultWidget({ results }) {
  // const { width, height } = useWindowSize();

  return (
    <Widget>
      <Widget.Header>
        Tela de Resultado
      </Widget.Header>

      <Widget.Content>
        {/* <p>
          {`Você acertou
          ${results.reduce((somatoriaAtual, resultAtual) => {
            const isAcerto = resultAtual === true;
            if (isAcerto) {
              return somatoriaAtual + 1;
            }
            return somatoriaAtual;
          }, 0)}
          perguntas`}
        </p> */}
        <p>
          {`Você acertou
          ${results.filter((x) => x).length}
          perguntas`}
        </p>
        <ul>
          {results.map((result, index) => (
            <li key={`result__${result}`}>
              #
              {index + 1}
              : Resultado:
              {result === true
                ? 'Acertou'
                : 'Errou'}
            </li>
          ))}
        </ul>
      </Widget.Content>

      {/* <Confetti
        width={width}
        height={height}
      /> */}
    </Widget>
  );
}

function LoadingWidget() {
  return (
    <Widget>
      <Widget.Header>
        Carregando...
      </Widget.Header>

      <Widget.Content>
        [Desafio do Loading]
      </Widget.Content>
    </Widget>
  );
}

function QuestionWidget({
  question,
  totalQuestions,
  questionIndex,
  onSubmit,
  addResult,
}) {
  const [selectedAlternative, setSelectedAlternative] = React.useState(undefined);
  const [isQuestionSubmited, setIsQuestionSubmited] = React.useState(false);
  const questionId = `question__${questionIndex}`;
  const isCorrect = selectedAlternative === question.answer;
  const hasAlternativeSelected = selectedAlternative !== undefined;

  return (
    <Widget>
      <Widget.Header>
        <BackLinkArrow href="/" />
        <h3>
          {`Pergunta ${questionIndex + 1} de ${totalQuestions}`}
        </h3>
      </Widget.Header>
      <img
        alt="Descrição"
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
        }}
        src={question.image}
      />
      <Widget.Content>
        <h2>
          {question.title}
        </h2>
        <p>
          {question.description}
        </p>

        <AlternativesForm
          onSubmit={(infosDoEvento) => {
            infosDoEvento.preventDefault();
            setIsQuestionSubmited(true);
            setTimeout(() => {
              addResult(isCorrect);
              setIsQuestionSubmited(false);
              setSelectedAlternative(undefined);
              onSubmit();
            }, 1 * 1000);
          }}
        >
          {question.alternatives.map((alternative, alternativeIndex) => {
            const alternativeId = `alternative__${alternativeIndex}`;
            const alternativeStatus = isCorrect ? 'SUCCESS' : 'ERROR';
            const isSelected = selectedAlternative === alternativeIndex;
            return (
              <Widget.Topic
                as="label"
                key={alternativeId}
                htmlFor={alternativeId}
                data-selected={isSelected}
                data-status={isQuestionSubmited && alternativeStatus}
              >
                <input
                  style={{ display: 'none' }}
                  id={alternativeId}
                  name={questionId}
                  onChange={() => setSelectedAlternative(alternativeIndex)}
                  type="radio"
                />
                {alternative}
              </Widget.Topic>
            );
          })}

          <Button type="submit" disabled={!hasAlternativeSelected}>
            Confirmar
          </Button>

          {isQuestionSubmited && isCorrect && <p>Você acertou!</p>}
          {isQuestionSubmited && !isCorrect && <p>Você errou!</p>}
        </AlternativesForm>

      </Widget.Content>
    </Widget>
  );
}

const screenStates = {
  QUIZ: 'QUIZ',
  LOADING: 'LOADING',
  RESULT: 'RESULT',
};

export default function QuizScreen({ externalQuestions, externalBg }) {
  const [screenState, setScreenState] = React.useState(screenStates.LOADING);
  const [results, setResults] = React.useState([]);
  const totalQuestions = externalQuestions.length;
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const questionIndex = currentQuestion;
  const question = externalQuestions[questionIndex];
  const bg = externalBg;

  function addResult(result) {
    setResults([
      ...results,
      result,
    ]);
  }

  React.useEffect(() => {
    setTimeout(() => {
      setScreenState(screenStates.QUIZ);
    }, 1 * 1000);
  }, []);

  function handleSubmitQuiz() {
    const nextQuestion = questionIndex + 1;
    if (nextQuestion < totalQuestions) {
      setCurrentQuestion(questionIndex + 1);
    } else {
      setScreenState(screenStates.RESULT);
    }
  }

  return (
    <QuizBackground backgroundImage={bg}>
      <QuizContainer>
        <QuizLogo />
        {screenState === screenStates.QUIZ && (
          <QuestionWidget
            question={question}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            onSubmit={handleSubmitQuiz}
            addResult={addResult}
          />
        )}

        {screenState === screenStates.LOADING && <LoadingWidget />}
        {screenState === screenStates.RESULT && <ResultWidget results={results} />}
      </QuizContainer>
    </QuizBackground>
  );
}
