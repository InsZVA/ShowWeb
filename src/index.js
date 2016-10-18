/**
 * Created by InsZVA on 2016/10/17.
 */
import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import darkBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Main from './components/main';

injectTapEventPlugin();
const App=()=>(
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <Main />
    </MuiThemeProvider>
);

render(<App />, document.getElementById('app'));