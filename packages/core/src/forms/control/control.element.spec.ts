/*
 * Copyright (c) 2016-2021 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { html } from 'lit-html';
import { removeTestElement, createTestElement, componentIsStable } from '@cds/core/test';
import { CdsIcon } from '@cds/core/icon';
import { CdsControl } from '@cds/core/forms';
import '@cds/core/forms/register.js';
import { CdsControlMessage } from '../control-message/control-message.element';
import { listenForAttributeChange } from '@cds/core/internal';
import { ControlLabelLayout } from './control.element';

describe('cds-control', () => {
  let element: HTMLElement;
  let control: CdsControl;
  let controlInGroup: CdsControl;
  let message: CdsControlMessage;
  let label: HTMLLabelElement;
  let input: HTMLInputElement;
  let datalist: HTMLDataListElement;
  const getStatusIcon = () => control.shadowRoot.querySelector<CdsIcon>('cds-icon');

  beforeEach(async () => {
    element = await createTestElement(html`
      <cds-control validate>
        <label>control</label>
        <input type="text" require />
        <datalist>
          <option value="item 1"></option>
          <option value="item 2"></option>
          <option value="item 3"></option>
        </datalist>
        <cds-control-message error="valueMissing">message text</cds-control-message>
      </cds-control>

      <div cds-control-group>
        <cds-control id="control-in-group">
          <label>control in group</label>
          <input type="text" />
        </cds-control>
      </div>
    `);

    control = element.querySelector<CdsControl>('cds-control');
    controlInGroup = element.querySelector<CdsControl>('#control-in-group');
    label = element.querySelector<HTMLLabelElement>('label');
    input = element.querySelector<HTMLInputElement>('input');
    datalist = element.querySelector<HTMLDataListElement>('datalist');
    message = element.querySelector<CdsControlMessage>('cds-control-message');
  });

  afterEach(() => {
    removeTestElement(element);
  });

  it('should associate the label and input', () => {
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
  });

  it('should associate the input and messages', () => {
    expect(input.getAttribute('aria-describedby').trim()).toBe(message.id);
  });

  it('should associate the input and datalist if available', async () => {
    await componentIsStable(control);
    expect(datalist.id).toBe(input.id + '-datalist');
    expect(input.getAttribute('list')).toBe(datalist.id);
  });

  it('should show appropriate status icon', async () => {
    await componentIsStable(control);
    expect(getStatusIcon()).toBe(null);

    control.status = 'error';
    await componentIsStable(control);
    expect(getStatusIcon().status).toBe('danger');

    control.status = 'success';
    await componentIsStable(control);
    expect(getStatusIcon().status).toBe('success');
  });

  it('should apply disabled styles when native input is disabled', async () => {
    await componentIsStable(control);
    expect(input.hasAttribute('disabled')).toBe(false);

    input.setAttribute('disabled', '');
    await componentIsStable(control);
    expect(control.hasAttribute('_disabled')).toBe(true);

    input.removeAttribute('disabled');
    await componentIsStable(control);
    expect(control.hasAttribute('_disabled')).toBe(false);

    input.disabled = true;
    await componentIsStable(control);
    expect(control.hasAttribute('_disabled')).toBe(true);
  });

  it('should allow control of the input width', async () => {
    control.style.width = '500px';

    control.controlWidth = 'stretch';
    await componentIsStable(control);
    const initialInputWidth = input.getBoundingClientRect().width;

    control.controlWidth = 'shrink';
    await componentIsStable(control);
    const updatedInputWidth = input.getBoundingClientRect().width;

    expect(initialInputWidth > updatedInputWidth).toBe(true);
  });

  it('should hide label appropriately for a11y when set for inline groups', async () => {
    await componentIsStable(control);
    expect(control.shadowRoot.querySelector('cds-internal-control-label')).toBeTruthy();

    control.labelLayout = ControlLabelLayout.inputGroup;
    control.status = 'error';
    await componentIsStable(control);
    expect(control.shadowRoot.querySelector('cds-icon[status=error]')).toBe(null);
    expect(control.shadowRoot.querySelector('cds-internal-control-label')).toBe(null);
    expect(control.shadowRoot.querySelector('slot[name=label]').parentElement.getAttribute('cds-layout')).toBe(
      'display:screen-reader-only'
    );
  });

  it('should mark layout as stable when using a hidden label layout', async () => {
    await componentIsStable(control);
    control.labelLayout = ControlLabelLayout.hiddenLabel;
    expect(await control.layoutStable).toBe(true);
  });

  it('should apply focus style attribute when native element is focused', async () => {
    input.dispatchEvent(new Event('focusin'));
    await componentIsStable(control);
    expect(control.getAttribute('_focused')).toBe('');

    input.dispatchEvent(new Event('focusout'));
    await componentIsStable(control);
    expect(control.getAttribute('_focused')).toBe(null);
  });

  it('should apply disabled style attribute when native input is disabled', done => {
    expect(control.getAttribute('disabled')).toBe(null);

    listenForAttributeChange(control, '_disabled', () => {
      expect(control.getAttribute('_disabled')).toBe('');
      done();
    });

    input.setAttribute('disabled', '');
  });

  it('should apply readonly style attribute when native input is readonly', done => {
    expect(control.getAttribute('readonly')).toBe(null);

    listenForAttributeChange(control, '_readonly', () => {
      expect(control.getAttribute('_readonly')).toBe('');
      done();
    });

    input.setAttribute('readonly', '');
  });

  it('should convert form layout types to control layout types', () => {
    (control.layout as any) = 'horizontal-inline';
    expect(control.layout).toBe('horizontal');

    (control.layout as any) = 'vertical-inline';
    expect(control.layout).toBe('vertical');

    control.layout = null;
    expect(control.layout).toBe('horizontal');
  });

  it('should setup native html validation if set', async () => {
    await componentIsStable(control);
    expect(message.getAttribute('hidden')).toBe('');
  });

  it('should adjust style for RTL language support', async () => {
    expect(control.shadowRoot.querySelector('.rtl')).toBe(null);
    control.style.direction = 'rtl';
    control.requestUpdate();
    await componentIsStable(control);
    expect(control.shadowRoot.querySelector('.rtl')).toBeTruthy();
  });

  it('should not set input inline padding style if no control actions are used', async () => {
    await componentIsStable(control);
    expect(control.inputControl.hasAttribute('style')).toBe(false);
  });

  it('should set the control slot if created in a control group element', async () => {
    await componentIsStable(controlInGroup);
    await componentIsStable(control);
    expect(controlInGroup.getAttribute('slot')).toBe('controls');
    expect(control.getAttribute('slot')).toBe(null);
  });
});

describe('cds-control validation', () => {
  let element: HTMLElement;
  let message: CdsControlMessage;

  beforeEach(async () => {
    element = await createTestElement(html`
      <form novalidate>
        <cds-control validate>
          <label>control</label>
          <input type="text" require />
          <cds-control-message error="valueMissing">message text</cds-control-message>
        </cds-control>
      </form>
    `);

    message = element.querySelector<CdsControlMessage>('cds-control-message');
  });

  afterEach(() => {
    removeTestElement(element);
  });

  it('should prevent native html validation setup if form is set to novalidate', () => {
    expect(message.getAttribute('hidden')).toBe(null);
  });
});

describe('cds-control responsive', () => {
  let element: HTMLElement;
  let control: CdsControl;

  beforeEach(async () => {
    element = await createTestElement(html`
      <cds-control layout="compact">
        <label>control</label>
        <input type="text" />
        <cds-control-message>message text</cds-control-message>
      </cds-control>
    `);

    control = element.querySelector<CdsControl>('cds-control');
  });

  afterEach(() => {
    removeTestElement(element);
  });

  xit('should adjust layout based on available width', async () => {
    await componentIsStable(control);
    expect(control.getAttribute('layout')).toBe('compact');

    // control.addEventListener('layoutChange', () => {
    //   expect(control.layout).toBe('vertical');
    //   done();
    // });

    // control.style.width = '100px';
    // await componentIsStable(control);
    // expect(control.layout).toBe('vertical');
  });
});

describe('cds-control with aria-label', () => {
  let element: HTMLElement;
  let control: CdsControl;

  beforeEach(async () => {
    element = await createTestElement(html`
      <cds-control layout="compact">
        <input type="text" aria-label="control" />
        <cds-control-message>message text</cds-control-message>
      </cds-control>
    `);

    control = element.querySelector<CdsControl>('cds-control');
  });

  afterEach(() => {
    removeTestElement(element);
  });

  it('should not enable hidden label', async () => {
    await componentIsStable(control);
    expect(control.labelLayout).toBe(ControlLabelLayout.ariaLabel);
  });
});
