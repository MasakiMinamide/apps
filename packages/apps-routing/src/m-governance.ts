// Copyright 2017-2019 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from './types';
import MGovernance from '@polkadot/app-m-governance';

export default ([
  {
    Component: MGovernance,
    display: {
      isHidden: false,
      needsAccounts: true,
      needsApi: [
        'tx.balances.transfer'
      ]
    },
    i18n: {
      defaultValue: 'MGovernance'
    },
    icon: 'columns',
    name: 'm-governance'
  }
] as Routes);
