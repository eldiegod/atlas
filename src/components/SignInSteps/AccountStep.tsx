import accountCreation from '@/assets/account-creation.svg'
import { useUser } from '@/hooks'
import { Text } from '@/shared/components'
import { transitions } from '@/shared/theme'
import React, { FormEvent, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import {
  StyledSpinner,
  AccountStepImg,
  AccountsWrapper,
  AccountWrapper,
  AccountInfo,
  IconWrapper,
  OrderedSteps,
  OrderedStep,
  IconGroup,
  AccountAddress,
  StyledRadioButton,
  StyledButton,
  SubTitle,
  StyledStepWrapper,
} from './AccountStep.style'
import polkadotIcon from '@/assets/polkadot-logo.svg'
import joystreamIcon from '@/assets/joystream-logo.svg'
import { StepFooter, BottomBarIcon, StepSubTitle, StepTitle, StepWrapper, StyledLogo } from './SignInSteps.style'
import { useNavigate } from 'react-router'
import { SvgGlyphChannel, SvgOutlineConnect } from '@/shared/icons'

type AccountStepProps = {
  nextStepPath: string
}

const AccountStep: React.FC<AccountStepProps> = ({ nextStepPath }) => {
  const navigate = useNavigate()
  const { accounts, setActiveUser, memberships, membershipsLoading } = useUser()
  const [selectedAccountAddress, setSelectedAccountAddress] = useState<undefined | string>()

  const membershipsControllerAccounts = memberships?.map((a) => a.controllerAccount)
  const accountsWithNoMembership = (accounts || []).filter((el) => !membershipsControllerAccounts?.includes(el.id))

  const handleSubmitSelectedAccount = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccountAddress) {
      return
    }
    setActiveUser({ accountId: selectedAccountAddress })
    navigate(nextStepPath)
  }

  const handleSelect = (id: string) => {
    setSelectedAccountAddress(id)
  }
  if (membershipsLoading) {
    return <StyledSpinner />
  }
  return (
    <SwitchTransition>
      <CSSTransition
        key={!accountsWithNoMembership?.length ? 'no-accounts' : 'accounts'}
        classNames={transitions.names.fadeAndSlide}
        timeout={parseInt(transitions.timings.routing)}
      >
        {!accountsWithNoMembership?.length ? (
          <StyledStepWrapper withBottomBar>
            <AccountStepImg src={accountCreation} />
            <StepTitle variant="h4">Create blockchain account</StepTitle>
            <SubTitle variant="body2" secondary>
              Use the Polkadot extension to generate your personal keypair. Follow these instructions:
            </SubTitle>
            <OrderedSteps>
              <OrderedStep secondary variant="caption" as="li">
                Open the extension popup with the icon in your browser bar
              </OrderedStep>
              <OrderedStep secondary variant="caption" as="li">
                Click the plus icon
              </OrderedStep>
              <OrderedStep secondary variant="caption" as="li">
                Continue with instructions presented on the screen
              </OrderedStep>
            </OrderedSteps>
            <StepFooter>
              <BottomBarIcon />
              <Text variant="body2" secondary>
                Make sure to safely save your seed phrase!
              </Text>
            </StepFooter>
          </StyledStepWrapper>
        ) : (
          <form onSubmit={handleSubmitSelectedAccount}>
            <StepWrapper>
              <IconGroup>
                <StyledLogo src={polkadotIcon} alt="Polkadot icon" />
                <SvgOutlineConnect />
                <StyledLogo src={joystreamIcon} alt="Joystream icon" />
              </IconGroup>
              <StepTitle variant="h4">Connect account</StepTitle>
              <StepSubTitle secondary>
                Select Polkadot account which you want to use to manage your new Joystream membership:
              </StepSubTitle>
              <AccountsWrapper>
                {accountsWithNoMembership?.map(({ id, name }) => (
                  <AccountBar
                    key={id}
                    id={id}
                    name={name}
                    onSelect={() => handleSelect(id)}
                    selectedValue={selectedAccountAddress}
                  />
                ))}
              </AccountsWrapper>
              <StepFooter>
                <StyledButton type="submit" disabled={!selectedAccountAddress}>
                  Connect account
                </StyledButton>
              </StepFooter>
            </StepWrapper>
          </form>
        )}
      </CSSTransition>
    </SwitchTransition>
  )
}

export type AccountBarProps = {
  name?: string
  id?: string
  onSelect?: () => void
  selectedValue?: string
}

const AccountBar: React.FC<AccountBarProps> = ({ name, id, onSelect, selectedValue }) => {
  return (
    <AccountWrapper isSelected={selectedValue === id}>
      <AccountInfo>
        <IconWrapper>
          <SvgGlyphChannel />
        </IconWrapper>
        <div>
          <Text variant="subtitle1">{name}</Text>
          <AccountAddress secondary variant="caption">
            {id}
          </AccountAddress>
        </div>
      </AccountInfo>
      <StyledRadioButton value={id} onChange={onSelect} selectedValue={selectedValue} />
    </AccountWrapper>
  )
}

export default AccountStep
