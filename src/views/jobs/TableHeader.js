// ** Next Import
import Link from 'next/link'
import { forwardRef, Fragment, useState } from 'react'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import format from 'date-fns/format'
import moment from 'moment'

// ** MUI Imports
import Box from '@mui/material/Box'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

import { useDispatch, useSelector } from 'react-redux'
import { convertTimeZoneToReadableDate, convertTimeZoneToReadableTime } from 'src/configs/utils'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

const DialogBox = ({ onDownloadClickHandler, open, setOpen, handleClickOpen, handleClose }) => {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [date, setDate] = useState([])

  const CustomInput = forwardRef((props, ref) => {
    const startDate = Boolean(props.start) ? format(props.start, 'MM/dd/yyyy') : ''
    const endDate = Boolean(props.end) ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
    const value = `${startDate}${endDate !== null ? endDate : ''}`
    props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
    const updatedProps = { ...props }
    delete updatedProps.setDates
    return <TextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
  })

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDate(date)
    }
    setStart(start)
    setEnd(end)
  }

  const setDatesHandler = val => {
    setDate(val)
  }

  return (
    <Fragment>
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        TransitionComponent={Transition}
        aria-labelledby='alert-dialog-slide-title'
        aria-describedby='alert-dialog-slide-description'
        sx={{
          '& .MuiPaper-root': {
            width: '700px',
            height: '580px'
          }
        }}
      >
        <DialogTitle id='alert-dialog-slide-title'>Select The Lunch Dates</DialogTitle>
        <DialogContent style={{ paddingTop: '20px', paddingLeft: '10px' }}>
          <DatePickerWrapper>
            <DatePicker
              isClearable
              selectsRange
              monthsShown={2}
              endDate={end}
              selected={start}
              startDate={start}
              shouldCloseOnSelect={false}
              id='date-range-picker-months'
              onChange={handleOnChangeRange}
              customInput={
                <CustomInput
                  dates={date}
                  setDates={setDatesHandler}
                  label='Slect Lunch Dates Range'
                  end={end}
                  start={start}
                />
              }
            />
          </DatePickerWrapper>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>Close</Button>
          <Button variant='contained' onClick={() => onDownloadClickHandler(start, end)}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

const TableHeader = props => {
  const store = useSelector(state => state)

  const downloadCSV = (start, end) => {
    let jobsData = store.jobs.data
    if (start) {
      jobsData = jobsData.filter(val => moment(val.question_l_0__c).isSameOrAfter(moment(start), 'D'))
    }
    if (end) {
      jobsData = jobsData.filter(val => moment(val.question_l_0__c).isSameOrBefore(moment(end), 'D'))
    }
    let lunchData = jobsData.filter(val => val.question_1__c)
    let csv =
      'Physician name ,,Speciality,NPI Number,Address,,,,,Telephone number,Each of the questions in separate columns ,,,,,,,,,\n'
    csv +=
      'First ,Last,,,Unit,Street,City,State ,ZIP code,,How many people attached the lunch,"Names, separated by comma","How many physicians, PAs and NSs",,,Total lunch cost,Per physician cost,Category ,Date,Time,Product Advocate\n'

    lunchData.forEach(function (row) {
      csv += `${row.Prescriber__r.First_Name__c},`
      csv += `${row.Prescriber__r.Last_Name__c},`
      csv += `${row.Prescriber__r.Speciality__c},`
      csv += `${row.Prescriber__r.NPI__c},`
      csv += ',' // unit
      csv += `"${row.Prescriber__r.Street_Address__c?.replace(/#/g, '')}",`
      csv += `${row.Prescriber__r.City__c},`
      csv += `${row.Prescriber__r.State__c},`
      csv += `${row.Prescriber__r.Zip__c},`
      csv += `${row.Prescriber__r.Phone__c},`
      csv += `"${row.question_l_1A__c}",`
      csv += `"${row.question_l_1B__c}",`
      csv += `"${row.question_l_1C__c}",`
      csv += `"${row.question_l_1D__c}",`
      csv += ',' //Empty Column
      csv += `"${row.question_l_2__c}",`
      csv += parseFloat(row.question_l_2__c / row.question_l_1A__c).toFixed(2) + ','
      csv += `${row.question_l_4__c},`
      csv += convertTimeZoneToReadableDate(row.question_l_0__c) + ',' // date
      csv += convertTimeZoneToReadableTime(row.question_l_0__c) + ',' // time
      csv += `${row.product_advocate.name},`

      // console.log('row Data --> ', row)
      csv += '\n'
    })

    var hiddenElement = document.createElement('a')
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
    hiddenElement.target = '_blank'

    //provide the name for the CSV file to be downloaded
    hiddenElement.download = 'Lunch Data.csv'
    hiddenElement.click()
  }

  const [open, setOpen] = useState(false)
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box></Box>
      <DialogBox
        open={open}
        setOpen={setOpen}
        onDownloadClickHandler={downloadCSV}
        handleClickOpen={handleClickOpen}
        handleClose={handleClose}
      />
      <Box>
        <Button sx={{ mb: 2, mr: 2 }} onClick={handleClickOpen} variant='contained'>
          Download Lunch CSV
        </Button>
        <Button sx={{ mb: 2, mr: 2 }} onClick={() => props.onClick()} variant='contained'>
          Download Data CSV
        </Button>
      </Box>
    </Box>
  )
}

export default TableHeader
