import React, { useEffect, useLayoutEffect, useCallback, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './context-menu.scss';

interface ContextMenuItem {
    html?: string;
    label?: string;
    callback?: () => void;
    divider?: boolean;
}

interface ContextMenuProps {
    items: ContextMenuItem[];
    x: number;
    y: number;
    parent: HTMLElement;
}

function ContextMenu(props: ContextMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({x: props.x ?? 0, y: props.y ?? 0});

	useLayoutEffect(() => {
		const menu = menuRef.current;
        if (!menu) return;

		const {x, y} = position;
		const {width, height} = menu.getBoundingClientRect();
		const {innerWidth, innerHeight} = window;
		
		menu.style.left = '';
		menu.style.right = '';
		menu.style.top = '';
		menu.style.bottom = '';

		let anchor = '';

		if (x + width > innerWidth) {
			menu.style.right = `${innerWidth - x}px`;
			anchor += 'right';
		} else {
			menu.style.left = `${x}px`;
			anchor += 'left';
		}
		anchor += ' ';
		if (y + height > innerHeight) {
			menu.style.bottom = `${innerHeight - y}px`;
			anchor += 'bottom';
		} else {
			menu.style.top = `${y}px`;
			anchor += 'top';
		}
		menu.style.transformOrigin = anchor;
		menu.animate([
			{width: '0px', height: '0px', opacity: 0.3},
			{width: `${width}px`, height: `${height}px`, opacity: 1}
		], {
			duration: 150,
			easing: 'cubic-bezier(0.4, 0, 0, 1)',
			fill: 'forwards'
		});
	}, [position]);

	const closeMenu = useCallback(() => {
        if (!menuRef.current) return;
		const animation = menuRef.current.animate([
			{opacity: 1},
			{opacity: 0}
		], {
			duration: 150,
			easing: 'ease-out',
			fill: 'forwards'
		});
        
        animation.onfinish = () => {
            try {
                (ReactDOM as any).unmountComponentAtNode(props.parent);
            } catch (e) {
                console.error("Failed to unmount context menu", e);
            }
			props.parent.remove();
		}
	}, [props.parent]);

	useEffect(() => {
        if (menuRef.current) {
		    menuRef.current.focus();
		    menuRef.current.addEventListener('blur', closeMenu);
        }
		return () => {
            if (menuRef.current) {
			    menuRef.current.removeEventListener('blur', closeMenu);
            }
		}
	}, [closeMenu]);


	return ( 
		<div className="rnp-context-menu" tabIndex={0} ref={menuRef}>
			{props.items.map((item, index) => (
				item.divider ?
				<div className="rnp-context-menu-devider" key={index} />
				:
				<div 
					key={index}
					className="rnp-context-menu-item"
					onClick={
						() => {
							if (item.callback) {
								item.callback();
							}
							closeMenu();
						}
					}
				>
					{item.html ? <div dangerouslySetInnerHTML={{__html: item.html}} /> : item.label}
				</div>
			))}
		</div>
	)
}

export function showContextMenu(x: number, y: number, items: ContextMenuItem[]) {
	const div = document.createElement('div');
	document.body.appendChild(div);
	(ReactDOM as any).render(<ContextMenu items={items} x={x} y={y} parent={div} />, div);
}
