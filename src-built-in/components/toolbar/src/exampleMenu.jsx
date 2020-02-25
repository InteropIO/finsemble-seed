import * as React from 'react'
import { MenuShell } from '@chartiq/finsemble-ui/lib/components/menu/menuShell'
import { MenuActivator } from '@chartiq/finsemble-ui/lib/components/menu/menuActivator'
import { Menu } from '@chartiq/finsemble-ui/lib/components/menu/menu'
import { MenuItem } from '@chartiq/finsemble-ui/lib/components/menu/menuItem'
import { MenuHotKey } from '@chartiq/finsemble-ui/lib/components/menu/menuHotKey'
import { KeyboardNavigation } from '@chartiq/finsemble-ui/lib/components/menu/keyboardNavigation'
import { MenuTitle } from '@chartiq/finsemble-ui/lib/components/menu/menuTitle'

const FinsembleIcon = () => {
	return <img className="finsemble-toolbar-brand-logo" src="../../assets/img/Finsemble_Taskbar_Icon.png" />
}

const { useState, useEffect } = React;

export const ExampleMenu = () => {
	const onClick = () => alert('You clicked');
	return (
		<MenuShell id="iconMenu">
			<MenuHotKey open={["shift", "down arrow"]} />
			<MenuHotKey close={["shift", "up arrow"]} />
			<MenuHotKey close={["escape"]} />
			<MenuActivator><FinsembleIcon /></MenuActivator>
			<Menu>
				<MenuItem>Restart</MenuItem>
				<MenuItem>Reset</MenuItem>
				<MenuTitle>My Title</MenuTitle>
				<MenuItem>Quit</MenuItem>
				<MenuItem onClick={onClick}>onClick</MenuItem>
				<MenuItem noclose="true">No close</MenuItem>
			</Menu>
		</MenuShell>
	)
}


export const ExampleMenu2 = () => {
	return (
		<MenuShell id="mymenu">
			<MenuHotKey close={["escape"]} />
			<MenuActivator>
				My Menu
		</MenuActivator>
			<Menu>
				<MenuItem>One</MenuItem>
				<MenuItem>Two</MenuItem>
				<MenuItem>Three</MenuItem>
			</Menu>
		</MenuShell>
	)
}

export const AdvancedExample = () => {
	const [items, setItems] = useState([
		<MenuItem>Restart</MenuItem>,
		<MenuItem>Reset</MenuItem>,
		<MenuItem noclose="true">No close</MenuItem>,
		<div>
			<div>
				<div>
					<MenuItem>Deep child</MenuItem>
				</div>
			</div>
		</div>,
	]);
	const addMenuItem = () => {
		if (items.length >= 10) {return alert("Enough")}
		setItems([...items, <MenuItem>New item</MenuItem>])
	}
	return (
		<MenuShell id="advancedMenu">
			<MenuHotKey close={["escape"]} />
			<MenuActivator>Advanced</MenuActivator>
			<Menu>
				<KeyboardNavigation >
					<MenuTitle>Skip me</MenuTitle>
					<MenuItem noclose={true}> 
					<button onClick={addMenuItem}> Add MenuItem</button>
					</MenuItem>
						{items.map(item => item)}
				</KeyboardNavigation>
			</Menu>
		</MenuShell>
	)
}