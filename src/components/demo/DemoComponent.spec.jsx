import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import DemoComponent from './DemoComponent';

describe('DemoComponent: ', () => {
    const wrapper = mount(<DemoComponent />);

    it('應該要顯示文字，"this is demo"', () => {
        expect(wrapper.text()).to.contain('this is demo');
    });
});
