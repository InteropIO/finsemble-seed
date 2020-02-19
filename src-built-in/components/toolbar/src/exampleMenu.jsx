import * as React from 'react'
import { MenuShell } from '@chartiq/finsemble-ui/lib/components/menu/menuShell'
import { MenuActivator } from '@chartiq/finsemble-ui/lib/components/menu/menuActivator'
import { Menu } from '@chartiq/finsemble-ui/lib/components/menu/menu'
import { MenuItem } from '@chartiq/finsemble-ui/lib/components/menu/menuItem'
import { MenuHotKey } from '@chartiq/finsemble-ui/lib/components/menu/menuHotKey'

export const ExampleMenu = () => {
	const onClick = () => alert('You clicked');
	return (
		<MenuShell id="mymenu">
			<MenuHotKey open={["shift", "down arrow"]}/>
			<MenuHotKey close={["shift", "up arrow"]}/>
			<MenuActivator>
				My menu
			</MenuActivator>
			<Menu>
				<MenuItem>Restart</MenuItem>
				<MenuItem>Reset</MenuItem>
				<MenuItem>Quit</MenuItem>
				<MenuItem onClick={onClick}>onClick</MenuItem>
				<MenuItem noclose="true">No close</MenuItem>
			</Menu>
		</MenuShell>
	)
}