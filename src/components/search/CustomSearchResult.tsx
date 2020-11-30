import { SearchQuery } from '@finsemble/finsemble-ui/react/types/searchTypes';
import React from 'react'
// @ts-ignore
import ReactWeather from 'react-open-weather';
//Optional include of the default css styles
import 'react-open-weather/lib/css/ReactWeather.css';

interface Props {
  data: {
    name: string;
    type: string;
    icon: any;
    actions: Array<any>
  }
  searchQuery: SearchQuery
}


const CustomSearchResult = (props: Props) => {

  return (
    <div>
      <ReactWeather
        forecast="today"
        apikey="6ace92e6eae45c1f654a7f1f3b3c0146"
        type="city"
        city={props.data.name}
      />
    </div>
  )
}


export default CustomSearchResult
