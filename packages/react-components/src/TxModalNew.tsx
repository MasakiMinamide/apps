// Copyright 2017-2019 @polkadot/app-contracts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StringOrNull, FormProps$Hooks, FormProps$Refs, TxModalProps as Props } from './types';

import React, { useState, useEffect } from 'react';
import { Button, InputAddress, Modal, TxButton } from '@polkadot/react-components';
import { useForm } from '@polkadot/react-hooks';
import { isUndefined } from '@polkadot/util';

import translate from './translate';

interface ContentProps extends Props {
  hooks: FormProps$Hooks;
}

interface ButtonProps extends Props {
  refs: FormProps$Refs;
}

function renderTrigger ({ trigger: Trigger }: Props, onOpen: () => void): React.ReactNode {
  return Trigger ? <Trigger onOpen={onOpen} /> : null;
}

function renderHeader ({ t, header = t('Submit signed extrinsic') }: Props): React.ReactNode {
  return header;
}

function renderPreContent ({ preContent: PreContent = (): null => null, hooks }: ContentProps): React.ReactNode {
  return <PreContent {...hooks} />;
}

function renderContent ({ content: Content = (): null => null, hooks }: ContentProps): React.ReactNode {
  return <Content {...hooks} />;
}

function renderInputAccount ({ t, inputAddressLabel = t('using my account'), inputAddressHelp = t('Select the account to use for this action.'), inputAddressProps = {}, isDisabled }: Props, accountId: string | null, onChangeAccountId: (_: string | null) => void, isBusy = false): React.ReactNode {
  return (
    <InputAddress
      defaultValue={accountId}
      help={inputAddressHelp}
      isDisabled={isDisabled || isBusy}
      isInput={false}
      label={inputAddressLabel}
      onChange={onChangeAccountId}
      type='account'
      value={accountId}
      {...inputAddressProps}
    />
  );
}

function renderCancelButton ({ t, cancelButtonLabel = t('Cancel'), refs: { cancelButtonRef } }: ButtonProps, onClose: () => void): React.ReactNode {
  return (
    <>
      <Button
        isNegative
        onClick={onClose}
        label={cancelButtonLabel}
        icon='cancel'
        ref={cancelButtonRef}
      />
      <Button.Or />
    </>
  );
}

function renderSubmitButton ({ t, extrinsic, submitButtonLabel = t('Submit'), isDisabled = false, isUnsigned = false, isSubmittable = true, tx, params, refs: { submitButtonRef } }: ButtonProps, accountId: string | null, onSubmit: () => void, onSuccess: () => void, onFailed: () => void, submitButtonProps = {}): React.ReactNode {
  return (
    <TxButton
      {...(
        isUnsigned
          ? { isUnsigned: true }
          : { accountId }
      )}
      extrinsic={extrinsic}
      isDisabled={!isSubmittable || isDisabled}
      isPrimary
      label={submitButtonLabel}
      icon='sign-in'
      onClick={onSubmit}
      onFailed={onFailed}
      onSuccess={onSuccess}
      params={params}
      innerRef={submitButtonRef}
      tx={tx}
      {...submitButtonProps}
    />
  );
}

function TxModal<P extends Props> (props: P): React.ReactElement<P> {
  const isControlled = !isUndefined(props.isOpen);
  const isFixedAccount = !isUndefined(props.accountId);

  const { cancelButtonRef, submitButtonRef, ...hooks } = useForm();

  const [accountId, setAccountId] = useState<StringOrNull | undefined>(isFixedAccount ? props.accountId : null);
  const [isBusy, setIsBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(isControlled ? props.isOpen : false);

  const _onChangeAccountId = (accountId: StringOrNull): void => {
    setAccountId(accountId);

    props.onChangeAccountId && props.onChangeAccountId(accountId);
  };

  const _onOpen = (): void => {
    !isControlled && setIsOpen(true);

    props.onOpen && props.onOpen();
  };

  const _onClose = (): void => {
    !isControlled && setIsOpen(false);

    props.onClose && props.onClose();
  };

  const _onSubmit = (): void => {
    setIsBusy(true);

    props.onSubmit && props.onSubmit();
  };

  const _onFailed = (): void => {
    setIsBusy(false);

    props.onFailed && props.onFailed();
  };

  const _onSuccess = (): void => {
    setIsBusy(false);
    !isControlled && setIsOpen(false);

    props.onSuccess && props.onSuccess();
  };

  useEffect((): void => {
    !isUndefined(props.isOpen) && setIsOpen(props.isOpen);
  }, [props.isOpen]);

  useEffect((): void => {
    !isUndefined(props.accountId) && setAccountId(props.accountId);
  }, [props.accountId]);

  const modalProps = {
    className: ['ui--Modal', (props.modalProps || {}).className].join(' '),
    dimmer: 'inverted',
    ...(props.modalProps || {}),
    onClose: _onClose,
    open: isOpen
  };

  return (
    <>
      {props.trigger && renderTrigger(props, _onOpen)}
      <Modal {...modalProps}>
        <Modal.Header>
          {renderHeader(props)}
        </Modal.Header>
        <Modal.Content>
          {renderPreContent({ ...props, hooks })}
          {renderInputAccount(props, accountId || null, _onChangeAccountId, isBusy)}
          {renderContent({ ...props, hooks })}
        </Modal.Content>
        <Modal.Actions>
          <Button.Group>
            {renderCancelButton({ ...props, refs: { cancelButtonRef } }, _onClose)}
            {renderSubmitButton({ ...props, refs: { submitButtonRef } }, accountId || null, _onSubmit, _onSuccess, _onFailed)}
          </Button.Group>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default translate(TxModal);
