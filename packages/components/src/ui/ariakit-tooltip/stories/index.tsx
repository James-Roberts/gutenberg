/**
 * External dependencies
 */
import type { ComponentMeta, ComponentStory } from '@storybook/react';

/**
 * Internal dependencies
 */
import ToolTip from '..';
import Button from '../../../button';

const meta: ComponentMeta< typeof ToolTip > = {
	title: 'Components/AriaToolTip',
	component: ToolTip,
	argTypes: {
		children: { control: { type: null } },
		placement: {
			control: {
				type: 'select',
				options: [
					'BasePlacement',
					'top-start',
					'bottom-start',
					'left-start',
					'right-start',
					'top-end',
					'bottom-end',
					'left-end',
					'right-end',
				],
			},
		},
	},
	parameters: {
		controls: { expanded: true },
		docs: { source: { state: 'open' } },
	},
};
export default meta;

const Template: ComponentStory< typeof ToolTip > = ( props ) => (
	<ToolTip { ...props } />
);

export const Default: ComponentStory< typeof ToolTip > = Template.bind( {} );
Default.args = {
	children: <Button variant="primary">It&apos;s me, hi.</Button>,
	placement: 'bottom-start',
	text: 'Hi!',
};
