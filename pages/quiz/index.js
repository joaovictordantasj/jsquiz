/* eslint-disable react/prop-types */
import React from 'react';
import Confetti from 'react-confetti';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Lottie } from '@crello/react-lottie';
import useWindowSize from 'react-use/lib/useWindowSize';

import db from '../../db.json';
import Button from '../../src/components/Button';
import Widget from '../../src/components/Widget';
import QuizLogo from '../../src/components/QuizLogo';
import QuizContainer from '../../src/components/QuizContainer';
import BackLinkArrow from '../../src/components/BackLinkArrow';
import QuizBackground from '../../src/components/QuizBackground';
import AlternativesForm from '../../src/components/AlternativesForm';

import loadingAnimation from '../../src/assets/loading.json';

function ResultWidget({ results }) {
  const { width, height } = useWindowSize();
  const questoesAcertadas = results.filter((x) => x).length;
  const qtdQuestoes = db.questions.length;
  const gif = db.gifs;
  const router = useRouter();
  const { name } = router.query;

  return (
    <Widget>
      <Widget.Header>
        Tela de Resultado
      </Widget.Header>
      {questoesAcertadas === qtdQuestoes && (
        <>
          <img
            alt="Descrição"
            style={{
              width: '100%',
              height: '150px',
              objectFit: 'cover',
            }}
            src={gif.congratulations}
          />
          <Widget.Content>
            <h3>{`Parabéns ${name}! Você ACERTOU TODAS as perguntas`}</h3>
          </Widget.Content>
          <Confetti
            recycle={false}
            numberOfPieces={500}
            width={width}
            height={height}
          />
        </>
      )}
      {(questoesAcertadas < qtdQuestoes) && (questoesAcertadas > 0) && (
        <>
          <img
            alt="Descrição"
            style={{
              width: '100%',
              height: '150px',
              objectFit: 'cover',
            }}
            src={gif.almost}
          />
          <Widget.Content>
            <h3>{`OPS ${name}! você QUASE acertou todas as perguntas.`}</h3>
          </Widget.Content>
        </>
      )}
      {questoesAcertadas === 0 && (
        <>
          <img
            alt="Descrição"
            style={{
              width: '100%',
              height: '150px',
              objectFit: 'cover',
            }}
            src={gif.fail}
          />
          <Widget.Content>
            <h3>{`Vixe ${name}! Você ERROU TODAS as perguntas.`}</h3>
          </Widget.Content>
        </>
      )}
      <Widget.Content>
        <p>
          {`Você acertou ${questoesAcertadas} de ${qtdQuestoes} perguntas.`}
        </p>
        <ul>
          {results.map((result, index) => (
            <li key={`result__${result}`}>
              {`${index + 1}ª pergunta: ${result === true ? 'Acertou' : 'Errou'}`}
            </li>
          ))}
        </ul>
        <Link href="/">
          <Button href="/">Reiniciar o Quiz</Button>
        </Link>
      </Widget.Content>
    </Widget>
  );
}

function LoadingWidget() {
  return (
    <Widget>
      <Widget.Header>
        Carregando...
      </Widget.Header>

      <Widget.Content style={{ display: 'flex', justifyContent: 'center' }}>
        <Lottie
          width="200px"
          height="300px"
          className="lottie-container basic"
          config={{ animationData: loadingAnimation, loop: true, autoplay: true }}
        />
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
  const router = useRouter();
  const { name } = router.query;

  return (
    <Widget
      as={motion.section}
      transition={{ delay: 0, duration: 0.5 }}
      variants={{
        show: { opacity: 1, x: '0' },
        hidden: { opacity: 0, x: '-100%' },
      }}
      initial="hidden"
      animate="show"
    >
      <Widget.Header>
        <BackLinkArrow href="/" />
        <h3>
          {`Pergunta ${questionIndex + 1} de ${totalQuestions} para ${name}`}
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
                enabedLink
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

export default function QuizPage() {
  const [screenState, setScreenState] = React.useState(screenStates.LOADING);
  const [results, setResults] = React.useState([]);
  const totalQuestions = db.questions.length;
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const questionIndex = currentQuestion;
  const question = db.questions[questionIndex];

  function addResult(result) {
    setResults([
      ...results,
      result,
    ]);
  }

  React.useEffect(() => {
    setTimeout(() => {
      setScreenState(screenStates.QUIZ);
    }, 3 * 1000);
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
    <QuizBackground backgroundImage={db.bg}>
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
