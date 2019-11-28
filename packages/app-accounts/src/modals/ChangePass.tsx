// Copyright 2017-2019 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/react-components/types';

import React from 'react';
import { AddressRow, Button, Modal, Password } from '@polkadot/react-components';
import { ActionStatus } from '@polkadot/react-components/Status/types';
import { useForm, usePassword } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';

import translate from '../translate';

interface Props extends I18nProps {
  address: string;
  onClose: () => void;
}

function ChangePass (props: Props): React.ReactElement<Props> {
  const { address, onClose, t } = props;

  const {
    password: oldPassword,
    setPassword: setOldPassword,
    isPasswordValid: isOldPasswordValid,
    setIsPasswordValid: setIsOldPasswordValid
  } = usePassword();
  const {
    password: newPassword,
    setPassword: setNewPassword,
    isPasswordValid: isNewPasswordValid,
    setIsPasswordValid: setIsNewPasswordValid
  } = usePassword();

  const _onChangeOldPassword = (oldPassword: string): void => {
    setOldPassword(oldPassword);
  };

  const _onChangeNewPassword = (newPassword: string): void => {
    setNewPassword(newPassword);
  };

  const { onSubmit, onCancel } = useForm(
    (): void => {
      const status: Partial<ActionStatus> = {
        action: 'changePassword'
      };

      try {
        const account = address && keyring.getPair(address);

        if (!account) {
          status.message = t(`No keypair found for this address ${address}`);

          return;
        }

        try {
          if (!account.isLocked) {
            account.lock();
          }

          account.decodePkcs8(oldPassword);
        } catch (error) {
          setIsOldPasswordValid(false);
          status.message = error.message;

          return;
        }

        try {
          keyring.encryptAccount(account, newPassword);
          status.account = address;
          status.status = 'success';
          status.message = t('password changed');
        } catch (error) {
          setIsNewPasswordValid(false);
          status.status = 'error';
          status.message = error.message;

          return;
        }
      } catch (error) {
        status.message = error.message;

        return;
      }

      onClose();
    },
    onClose
  );

  return (
    <Modal
      className='app--accounts-Modal'
      dimmer='inverted'
      open
    >
      <Modal.Header>
        {t('Change account password')}
      </Modal.Header>
      <Modal.Content>
        <AddressRow
          isInline
          value={address}
        >
          <p>{t('This will apply to any future use of this account as stored on this browser. Ensure that you securely store this new password and that it is strong and unique to the account.')}</p>
          <div>
            <Password
              autoFocus
              help={t('The existing account password as specified when this account was created or when it was last changed.')}
              isError={!isOldPasswordValid}
              label={t('your current password')}
              onChange={_onChangeOldPassword}
              onEnter={onSubmit}
              onEscape={onCancel}
              tabIndex={1}
              value={oldPassword}
            />
            <Password
              help={t('The new account password. Once set, all future account unlocks will be performed with this new password.')}
              isError={!isNewPasswordValid}
              label={t('your new password')}
              onChange={_onChangeNewPassword}
              onEnter={onSubmit}
              onEscape={onCancel}
              tabIndex={2}
              value={newPassword}
            />
          </div>
        </AddressRow>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group>
          <Button
            icon='cancel'
            isNegative
            label={t('Cancel')}
            onClick={onCancel}
          />
          <Button.Or />
          <Button
            icon='sign-in'
            isDisabled={!isNewPasswordValid || !isOldPasswordValid}
            isPrimary
            label={t('Change')}
            onClick={onSubmit}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
}

export default translate(ChangePass);
