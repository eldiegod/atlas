import { useRouterQuery } from '@/hooks'
import { transitions } from '@/shared/theme'
import React from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import SignInMainView from './SignInMainView'
import SignInProcessView from './SignInProcessView'

const SignInJoinView = () => {
  const currentStep = useRouterQuery('step')
  return (
    <SwitchTransition>
      <CSSTransition
        key={currentStep ? 'shown' : 'not-shown'}
        classNames={transitions.names.fadeAndSlide}
        timeout={parseInt(transitions.timings.routing)}
      >
        {currentStep ? <SignInProcessView /> : <SignInMainView />}
      </CSSTransition>
    </SwitchTransition>
  )
}

export default SignInJoinView
