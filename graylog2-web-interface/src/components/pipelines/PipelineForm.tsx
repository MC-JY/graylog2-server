/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { cloneDeep } from 'lodash';

import { Row, Col, Button, Input } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';
import type { PipelineType } from 'stores/pipelines/PipelinesStore';
import { isPermitted } from 'util/PermissionsMixin';
import useCurrentUser from 'hooks/useCurrentUser';
import { FormSubmit } from 'components/common';

import BootstrapModalForm from '../bootstrap/BootstrapModalForm';

type Props = {
  pipeline: PipelineType,
  create: boolean,
  modal: boolean,
  save: (pipeline: PipelineType, callback: () => void) => void,
  onCancel?: () => void,
};

const PipelineForm = ({ pipeline, create, modal, save, onCancel }: Props) => {
  const currentUser = useCurrentUser();
  const [nextPipeline, setNextPipeline] = useState<PipelineType>(cloneDeep(pipeline));
  const [showModal, setShowModal] = useState<boolean>(false);

  const _openModal = () => {
    setShowModal(true);
  };

  const _onChange = ({ target }) => {
    setNextPipeline((currentPipeline) => ({ ...currentPipeline, [target.name]: getValueFromInput(target) }));
  };

  const _closeModal = () => {
    setShowModal(false);
  };

  const _onSaved = () => {
    _closeModal();

    if (create) {
      setNextPipeline(cloneDeep(pipeline));
    }
  };

  const _handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    save(nextPipeline, _onSaved);
  };

  const content = (
    <fieldset>
      <Input type="text"
             id="title"
             name="title"
             label="Title"
             autoFocus
             required
             onChange={_onChange}
             help="Pipeline name."
             value={nextPipeline.title} />

      <Input type="text"
             id="description"
             name="description"
             label="Description"
             onChange={_onChange}
             help="Pipeline description."
             value={nextPipeline.description} />
    </fieldset>
  );

  if (modal) {
    return (
      <span>
        <Button disabled={!isPermitted(currentUser.permissions, 'pipeline:edit')}
                onClick={_openModal}
                bsStyle="success">
          {create ? 'Add new pipeline' : 'Edit pipeline details'}
        </Button>
        <BootstrapModalForm show={showModal}
                            title={`${create ? 'Add new' : 'Edit'} pipeline ${nextPipeline.title}`}
                            onSubmitForm={_handleSubmit}
                            onCancel={_closeModal}
                            submitButtonText={create ? 'Add pipeline' : 'Update pipeline'}>
          {content}
        </BootstrapModalForm>
      </span>
    );
  }

  return (
    <form onSubmit={_handleSubmit}>
      {content}
      <Row>
        <Col md={12}>
          <FormSubmit submitButtonText={create ? 'Create pipeline' : 'Update pipeline'} onCancel={onCancel} />
        </Col>
      </Row>
    </form>
  );
};

PipelineForm.propTypes = {
  pipeline: PropTypes.object,
  create: PropTypes.bool,
  modal: PropTypes.bool,
  save: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

PipelineForm.defaultProps = {
  modal: true,
  create: false,
  pipeline: {
    id: undefined,
    title: '',
    description: '',
    stages: [{ stage: 0, rules: [] }],
  },
  onCancel: () => {},
};

export default PipelineForm;
