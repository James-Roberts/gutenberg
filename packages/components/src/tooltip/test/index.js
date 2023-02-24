/**
 * External dependencies
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import Tooltip from '../';
import Button from '../../button';

/**
 * WordPress dependencies
 */
import { TOOLTIP_DELAY } from '../index.js';

const props = {
	text: 'tooltip text',
	delay: TOOLTIP_DELAY,
};

function getWrappingPopoverElement( element ) {
	return element.closest( '.components-popover' );
}

describe( 'Tooltip', () => {
	describe( '#render()', () => {
		it( 'should not render the tooltip if multiple children are passed', () => {
			render(
				<Tooltip { ...props }>
					<Button>Button 1</Button>
					<Button>Button 2</Button>
				</Tooltip>
			);

			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
		} );

		it( 'should not render the tooltip if there is no focus', () => {
			render(
				<Tooltip { ...props }>
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			expect(
				screen.getByRole( 'button', { name: 'Hover Me!' } )
			).toBeVisible();
			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
		} );

		it( 'should render the tooltip when focusing anchor via tab', async () => {
			const user = userEvent.setup();

			render(
				<Tooltip { ...props }>
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			expect( document.body ).toHaveFocus();

			await user.tab();

			expect(
				screen.getByRole( 'button', { name: /Hover me!/i } )
			).toHaveFocus();

			await waitFor( () =>
				expect( screen.getByText( 'tooltip text' ) ).toBeVisible()
			);

			// Wait for the tooltip element to be positioned (aligned with the button)
			await waitFor( () =>
				expect(
					getWrappingPopoverElement(
						screen.getByText( 'tooltip text' )
					)
				).toBePositionedPopover()
			);
		} );

		it( 'should render the tooltip when anchor is hovered', async () => {
			const user = userEvent.setup();

			render(
				<Tooltip { ...props }>
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			const button = screen.getByRole( 'button', { name: 'Hover Me!' } );

			await user.hover( button );

			await waitFor( () =>
				expect( screen.getByText( 'tooltip text' ) ).toBeVisible()
			);

			// Wait for the tooltip element to be positioned (aligned with the button)
			await waitFor( () =>
				expect(
					getWrappingPopoverElement(
						screen.getByText( 'tooltip text' )
					)
				).toBePositionedPopover()
			);

			await user.unhover( button );

			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
		} );

		it( 'should not show tooltip on focus as result of mouse click', async () => {
			const user = userEvent.setup();

			render(
				<Tooltip { ...props }>
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			await user.click(
				screen.getByRole( 'button', { text: 'Hover Me!' } )
			);

			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
		} );

		it( 'should respect custom delay prop when showing tooltip', async () => {
			const user = userEvent.setup( { delay: TOOLTIP_DELAY } );
			const CUSTOM_DELAY = TOOLTIP_DELAY + 25;

			render(
				<Tooltip { ...props } delay={ CUSTOM_DELAY }>
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			const button = screen.getByRole( 'button', { name: 'Hover Me!' } );

			await user.hover( button );

			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();

			const tooltip = await screen.findByText( 'tooltip text' );

			expect( tooltip ).toBeVisible();

			// Wait for the tooltip element to be positioned (aligned with the button)
			await waitFor( () =>
				expect(
					getWrappingPopoverElement( tooltip )
				).toBePositionedPopover()
			);
		} );

		it( 'should show tooltip when an element is disabled', async () => {
			const user = userEvent.setup();

			render(
				<Tooltip { ...props }>
					<Button disabled>Click me</Button>
				</Tooltip>
			);

			const button = screen.getByRole( 'button', { name: /Click me/i } );

			expect( button ).toBeVisible();
			expect( button ).toBeDisabled();

			await user.hover( button );

			await waitFor( () =>
				expect( screen.getByText( 'tooltip text' ) ).toBeVisible()
			);

			// Wait for the tooltip element to be positioned (aligned with the button)
			await waitFor( () =>
				expect(
					getWrappingPopoverElement(
						screen.getByText( 'tooltip text' )
					)
				).toBePositionedPopover()
			);
		} );

		it( 'should not emit events back to children when they are disabled', async () => {
			const user = userEvent.setup();

			const onClickMock = jest.fn();
			const { container } = render(
				<Tooltip { ...props }>
					<Button disabled onClick={ onClickMock }>
						Click me
					</Button>
				</Tooltip>
			);

			// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
			const eventCatcher = container.querySelector( '.event-catcher' );
			await user.click( eventCatcher );
			expect( onClickMock ).not.toHaveBeenCalled();
		} );

		it( 'should not show tooltip if the mouse leaves the anchor before the tooltip has shown', async () => {
			const user = userEvent.setup();
			const onMouseEnterMock = jest.fn();
			const onMouseLeaveMock = jest.fn();
			const MOUSE_LEAVE_DELAY = TOOLTIP_DELAY - 200;

			render(
				<>
					<Tooltip { ...props }>
						<Button
							onMouseEnter={ onMouseEnterMock }
							onMouseLeave={ onMouseLeaveMock }
						>
							Hover Me!
						</Button>
					</Tooltip>
					<Button>Hover me instead!</Button>
				</>
			);

			await user.hover(
				screen.getByRole( 'button', {
					name: 'Hover Me!',
				} )
			);

			// Tooltip hasn't appeared yet
			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
			expect( onMouseEnterMock ).toHaveBeenCalledTimes( 1 );

			// Advance time by MOUSE_LEAVE_DELAY time
			await waitFor(
				() =>
					expect(
						screen.queryByText( 'tooltip text' )
					).not.toBeInTheDocument(),
				{ timeout: MOUSE_LEAVE_DELAY }
			);

			// Hover the other button, meaning that the mouse will leave the tooltip anchor
			await user.hover(
				screen.getByRole( 'button', {
					name: 'Hover me instead!',
				} )
			);

			// Tooltip still hasn't appeared yet
			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
			expect( onMouseEnterMock ).toHaveBeenCalledTimes( 1 );
			expect( onMouseLeaveMock ).toHaveBeenCalledTimes( 1 );

			// Advance time again, so that we reach the full TOOLTIP_DELAY time
			await waitFor(
				() =>
					expect(
						screen.queryByText( 'tooltip text' )
					).not.toBeInTheDocument(),
				{ timeout: TOOLTIP_DELAY }
			);

			// Tooltip won't show, since the mouse has left the anchor
			expect(
				screen.queryByText( 'tooltip text' )
			).not.toBeInTheDocument();
		} );

		it( 'should render the shortcut display text when a string is passed as the shortcut', async () => {
			const user = userEvent.setup();

			render(
				<Tooltip { ...props } shortcut="shortcut text">
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			await user.hover(
				screen.getByRole( 'button', { name: 'Hover Me!' } )
			);

			await waitFor( () =>
				expect( screen.getByText( 'shortcut text' ) ).toBeVisible()
			);

			// Wait for the tooltip element to be positioned (aligned with the button)
			await waitFor( () =>
				expect(
					getWrappingPopoverElement(
						screen.getByText( 'shortcut text' )
					)
				).toBePositionedPopover()
			);
		} );

		it( 'should render the shortcut display text and aria-label when an object is passed as the shortcut with the correct properties', async () => {
			const user = userEvent.setup();

			render(
				<Tooltip
					{ ...props }
					shortcut={ {
						display: 'shortcut text',
						ariaLabel: 'shortcut label',
					} }
				>
					<Button>Hover Me!</Button>
				</Tooltip>
			);

			await user.hover(
				screen.getByRole( 'button', { name: 'Hover Me!' } )
			);

			await waitFor( () =>
				expect( screen.getByText( 'shortcut text' ) ).toBeVisible()
			);

			// Wait for the tooltip element to be positioned (aligned with the button)
			await waitFor( () =>
				expect(
					getWrappingPopoverElement(
						screen.getByText( 'shortcut text' )
					)
				).toBePositionedPopover()
			);
		} );
	} );
} );
