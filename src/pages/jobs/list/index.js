// ** React Imports
import { Fragment, useState, useEffect, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

// ** Icons
import Send from 'mdi-material-ui/Send'
import Check from 'mdi-material-ui/Check'
import Close from 'mdi-material-ui/Close'
import ChartPie from 'mdi-material-ui/ChartPie'
import Download from 'mdi-material-ui/Download'
import ArrowDown from 'mdi-material-ui/ArrowDown'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import ContentCopy from 'mdi-material-ui/ContentCopy'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import DeleteOutline from 'mdi-material-ui/DeleteOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import ContentSaveOutline from 'mdi-material-ui/ContentSaveOutline'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData, deleteInvoice } from 'src/store/apps/invoice'
import { fetchJobsData } from 'src/store/jobs'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import TableHeader from 'src/views/jobs/TableHeader'
// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

// ** Styled Components
import { styled } from '@mui/material/styles'
import { convertDateToReadableFormat } from 'src/configs/utils'

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { cancelJob, onCancelJobHandler, onJobFilterChangeHandler, onRevisitFilterChangeHandler } from 'src/store/jobs'
import Autocomplete from '@mui/material/Autocomplete'

import moment from 'moment'
import { Button, Checkbox, FormControlLabel } from '@mui/material'
import { FastForward } from 'mdi-material-ui'

// ** CSV ARRAY FILE

/* eslint-disable */
const CustomInput = forwardRef((props, ref) => {
  const startDate = Boolean(props.start) ? format(props.start, 'MM/dd/yyyy') : ''
  const endDate = Boolean(props.end) ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`
  props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
  const updatedProps = { ...props }
  delete updatedProps.setDates
  return <TextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
})

/* eslint-enable */
const InvoiceList = () => {
  // ** State
  const [pageSize, setPageSize] = useState(10)
  const [filteredRows, setFilteredRows] = useState([])
  const [whoDidYouMeetWith, setWhoDidYouMeetWith] = useState([])
  const [prescribers, setPrescribers] = useState([])
  const [prescriberText, setPrescriberText] = useState('')
  const [selectedPrescriber, setSelectedPrescriber] = useState('')
  const [totalLunchSpent, setTotalLunchSpent] = useState('0')
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  // const [status, setStatus] = useState('')
  const [jobsWithLunches, setJobsWithLunches] = useState('null')
  const [meetWith, setMeetWith] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [seed, setSeed] = useState(1)

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state)

  useEffect(() => {
    console.log('CHECK', store.jobs.filter.difference_location_doctor__c)

    const startDate = moment(store.jobs.filter.startDateRange, 'YYYY-MM-DD')
    const formattedStartDate = startDate.format('YYYY-MM-DD')
    const endDate = moment(store.jobs.filter.endDateRange, 'YYYY-MM-DD')
    const formattedEndStartDate = endDate.format('YYYY-MM-DD')
    let fetchPageSize = pageSize

    const check = store.jobs.filter.jobs_with_lunches_only
    if (!store.jobs.filter.jobs_with_lunches_only) {
      check = 'null'
    }

    if (store.jobs.filter.dates.length === 0) {
      formattedStartDate = ''
      formattedEndStartDate = ''
    }

    if (pageSize * (page + 1) > store.jobs.totalRecords) {
      const Remain = pageSize * (page + 1) - store.jobs.totalRecords
      fetchPageSize = pageSize - Remain
    }
    setIsLoading(true)
    dispatch(
      fetchJobsData({
        page_num: page + 1,
        page_size: fetchPageSize || 10,
        status: store.jobs.filter.statusValue,
        product_advocate: store.jobs.filter.productAdvocateValue,
        start_date: formattedStartDate,
        end_date: formattedEndStartDate,
        meet_with: store.jobs.filter.meet_with,
        prescriber: store.jobs.filter.prescriberValue,
        lunch_meeting: check,
        radius: store.jobs.filter.difference_location_doctor__c
      })
    ).then(() => {
      setIsLoading(false)
    })
  }, [page, pageSize, store.jobs.filter])

  console.log(store.jobs.data)

  useEffect(() => {
    onFilterChangeHandler()
    if (store.jobs.data && store.jobs.data.length > 0 && whoDidYouMeetWith.length == 0) {
      onWhoDidYouMeetWithRender()
    }
  }, [store.jobs.data, store.jobs.filter, selectedPrescriber])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPrescriberOptions(prescriberText)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [prescriberText])

  const fetchPrescriberOptions = prescriberText => {
    var data = []
    let dataStore = [...store.prescribers.data]
    for (let i = 0; i < dataStore.length; i++) {
      const prescriber = dataStore[i]
      if (data.length == 10) {
        break
      } else {
        const name = prescriber.name ?? prescriber.Name
        if (name.toLowerCase().includes(prescriberText.toLowerCase())) {
          data.push({
            label: name,
            value: prescriber.id
          })
        }
      }
    }
    setPrescribers(data)
  }
  const onWhoDidYouMeetWithRender = () => {
    var result = []
    store.jobs.data.forEach(job => {
      const temp = job.question_2__c
      const findIndex = result.findIndex(val => val == temp)
      if (findIndex == -1 && temp) {
        result.push(temp)
      }
    })
    setWhoDidYouMeetWith(result)
  }
  const onFilterChangeHandler = () => {
    const {
      question_2__c,
      statusValue,
      productAdvocateValue,
      startDateRange,
      endDateRange,
      difference_location_doctor__c,
      jobs_with_lunches_only,
      revisits
    } = store.jobs.filter
    const data = store.jobs.data

    if (statusValue) {
      data = data.filter(val => val.job_stage == statusValue)
    }
    if (productAdvocateValue) {
      data = data.filter(val => val.product_advocate.id == productAdvocateValue)
    }

    if (startDateRange) {
      data = data.filter(val => moment(val.feedback_submitted_at__c).isSameOrAfter(moment(startDateRange), 'D'))
    }
    if (endDateRange) {
      data = data.filter(val => moment(val.feedback_submitted_at__c).isSameOrBefore(moment(endDateRange), 'D'))
    }

    if (difference_location_doctor__c) {
      data = data.filter(val => {
        if (difference_location_doctor__c == 'within') {
          return val.difference_location_doctor__c <= 0.1
        } else {
          return val.difference_location_doctor__c > 0.1
        }
      })
    }

    if (Array.isArray(question_2__c) && question_2__c.length > 0) {
      data = data.filter(val => {
        return question_2__c.findIndex(v => v == val.question_2__c) != -1
      })
    }

    if (selectedPrescriber) {
      data = data.filter(val => val.prescriber.id == selectedPrescriber)
    }

    if (revisits) {
      data = [...new Map(data.map(item => [item.prescriber.id, item])).values()]
    }

    if (jobs_with_lunches_only) {
      // data = data.filter(val => val.question_1__c == true)
      // var lunchSum = 0
      // data.forEach(a => {
      //   const temp = isNaN(a.question_l_2__c) ? 0 : a.question_l_2__c
      //   lunchSum += temp
      // })
      setTotalLunchSpent(Math.round(store.jobs.LunchesSum))
    } else {
      setTotalLunchSpent(0)
    }

    setFilteredRows(data)
  }

  const handleStatusValue = e => {
    dispatch(onJobFilterChangeHandler({ filter: 'statusValue', value: e.target.value }))
  }

  const handleProductAdvocateValue = e => {
    dispatch(onJobFilterChangeHandler({ filter: 'productAdvocateValue', value: e.target.value }))
  }

  const handleOnChangeRange = dates => {
    const [start, end] = dates

    const startDate = moment(start, 'YYYY-MM-DD')
    const formattedStartDate = startDate.format('YYYY-MM-DD')

    const endDate = moment(end, 'YYYY-MM-DD')
    const formattedEndStartDate = endDate.format('YYYY-MM-DD')
    if (formattedStartDate && formattedEndStartDate) {
      setStartDate(formattedStartDate)
      setEndDate(formattedEndStartDate)
      console.log('store date', formattedStartDate)
    }
    if (start !== null && end !== null) {
      dispatch(onJobFilterChangeHandler({ filter: 'dates', value: dates }))
    }
    dispatch(onJobFilterChangeHandler({ filter: 'startDateRange', value: start }))
    dispatch(onJobFilterChangeHandler({ filter: 'endDateRange', value: end }))
  }

  const setDatesHandler = val => {
    dispatch(onJobFilterChangeHandler({ filter: 'dates', value: val }))
  }

  const handleRadiusValue = e => {
    dispatch(onJobFilterChangeHandler({ filter: 'difference_location_doctor__c', value: e.target.value }))
  }

  const handlePrescriberValue = e => {
    dispatch(onJobFilterChangeHandler({ filter: 'prescriberValue', value: e.target.value }))
  }

  const handleWhoDidYouMeetWith = e => {
    const value = e.target.value
    // const temp = []
    // value.map(val => {
    //   const index = temp.findIndex(v => v == val)
    //   if (index == -1 && val) {
    //     temp.push(val)
    //   }
    // })
    console.log('CHECK', store.jobs.filter.meet_with)
    dispatch(onJobFilterChangeHandler({ filter: 'meet_with', value: e.target.value }))
  }

  const StyledLink = styled('a')(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.primary.main
  }))

  const cancelJobData = async row => {
    // Update the API
    dispatch(cancelJob({ job_id: row.id }))
    // Update the state
    var temp = store.jobs.data.map(s => Object.assign({}, s))
    const index = (temp.findIndex = temp.findIndex(d => d.Id == row.Id))
    temp[index].job_stage = 'Job cancelled'
    dispatch(onCancelJobHandler(temp))
  }

  const RowOptions = ({ row }) => {
    // ** State
    const [anchorEl, setAnchorEl] = useState(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = event => {
      setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    return (
      <Fragment>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <DotsVertical fontSize='small' />
        </IconButton>
        <Menu
          keepMounted
          disablePortal
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem
            onClick={() => {
              cancelJobData(row)
              handleRowOptionsClose()
            }}
          >
            <Close sx={{ fontSize: '1rem' }} /> Cancel Job
          </MenuItem>
        </Menu>
      </Fragment>
    )
  }

  const jobsListViewColumns = [
    {
      field: 'id',
      minWidth: 200,
      headerName: 'id',
      renderCell: ({ row }) => (
        <Link href={`/jobs/preview/${row.id}`} passHref>
          <StyledLink>{`${row.id}`}</StyledLink>
        </Link>
      )
    },
    {
      minWidth: 160,
      field: 'job_stage',
      headerName: 'Status',
      renderCell: ({ row }) => {
        ;<Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
          {row.job_stage}
        </Typography>
      }
    },
    {
      flex: 0.5,
      field: 'prescriber_name',
      minWidth: 300,
      headerName: 'Prescriber',
      renderCell: ({ row }) => {
        const { prescriber } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href={`/prescribers/preview/${prescriber.id}`} passHref>
                <StyledLink>{prescriber.name}</StyledLink>
              </Link>
              <Typography noWrap variant='caption'>
                {prescriber.address}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    // {
    //   flex: 0.5,
    //   field: 'is_soaanz_prescriber',
    //   minWidth: 200,
    //   headerName: 'Is Writing Soaanz',
    //   renderCell: ({ row }) => {
    //     return (
    //           <Typography noWrap variant='caption'>
    //              <Checkbox  checked={'true' == "true"? true: false } disabled/>
    //           </Typography>
    //     )
    //   }
    // },
    {
      flex: 0.5,
      field: 'product_advocate_name',
      minWidth: 200,
      headerName: 'Product Advocate',
      renderCell: ({ row }) => {
        const { product_advocate } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href={`/product_advocates/preview/${product_advocate.id}`} passHref>
                <StyledLink>{product_advocate.name}</StyledLink>
              </Link>
              <Typography noWrap variant='caption'>
                {product_advocate.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'feedback_submitted_at__c',
      headerName: 'Feedback Submitted At',
      renderCell: ({ row }) => (
        <Typography variant='body2'>{convertDateToReadableFormat(row.feedback_submitted_at__c) || ''}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'feedback_submitted_at__c',
      headerName: 'Feedback Submitted At',
      renderCell: ({ row }) => (
        <Typography variant='body2'>{convertDateToReadableFormat(row.feedback_submitted_at__c) || ''}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'Distance_To_Doctor__c',
      headerName: 'Distance to Doctor',
      renderCell: ({ row }) => (
        <Typography variant='body2' style={{ color: row.selected_far_doctor__c ? 'red' : 'green' }}>
          {/* {parseFloat(row.Distance_To_Doctor__c).toFixed(2)} */}
          {row?.Distance_To_Doctor__c === null ? ' ' : parseFloat(row?.Distance_To_Doctor__c).toFixed(2)}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'Time_Spent_At_Job__c',
      headerName: 'Time Spent (Minutes)',
      renderCell: ({ row }) => (
        <Typography variant='body2'>
          {row?.Time_Spent_At_Job__c === null ? ' ' : parseFloat(row?.Time_Spent_At_Job__c).toFixed(2)}
        </Typography>
      )
    },
    {
      flex: 0.3,
      minWidth: 70,
      field: 'difference_location_doctor__c',
      headerName: 'Feedback Distance',
      renderCell: ({ row }) => {
        var target = parseFloat(row.difference_location_doctor__c)
        return (
          <Button
            onClick={() => {
              window.open(
                'https://www.google.com/maps?saddr=' +
                  row.Location__Latitude__s +
                  ',' +
                  row.Location__Longitude__s +
                  '&daddr=' +
                  row.Prescriber__r.Location__Latitude__s +
                  ',' +
                  row.Prescriber__r.Location__Longitude__s
              )
              // console.log('https://www.google.com/maps?saddr='+row.Prescriber__r.Location__Latitude__s+','+row.Prescriber__r.Location__Longitude__s+'&daddr='+row.Prescriber__r.Location__Latitude__s+','+74.17241373437834)
            }}
          >
            <Typography style={{ color: target ? (target > 0.1 ? 'red' : 'green') : 'initial' }} variant='body2'>
              {target ? target.toFixed(2) : ''}
            </Typography>
          </Button>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 130,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='View'>
            <Box>
              <Link href={`/jobs/preview/${row.id}`} passHref>
                <IconButton size='small' component='a' sx={{ textDecoration: 'none' }}>
                  <EyeOutline fontSize='small' />
                </IconButton>
              </Link>
            </Box>
          </Tooltip>
          {row.job_stage != 'Job cancelled' && <RowOptions row={row} />}
        </Box>
      )
    }
  ]
  const columns = [...jobsListViewColumns]

  const toCSVForm = data => {
    let csv = ''

    const csvDataArray = [
      {
        key: 'Appointment_Date_Time__c',
        header: 'Appointment Date Time'
      },
      {
        key: 'Cost__c',
        header: 'Cost'
      },
      {
        key: 'CreatedDate',
        header: 'Created Date'
      },
      {
        key: 'Id',
        header: 'ID'
      },
      {
        key: 'LastModifiedDate',
        header: 'Last Modified Date'
      },
      {
        key: 'Status__c',
        header: 'Job Status'
      },
      {
        key: 'amount',
        header: 'Amount'
      },
      {
        key: 'difference_location_doctor__c',
        header: 'Difference Location Doctor'
      },
      {
        key: 'feedback_submitted_at__c',
        header: 'Feedback Submitted Date'
      },
      {
        key: 'job_id',
        header: 'Job Id'
      },
      {
        key: 'prescriber',
        key2: 'address',
        header: 'Prescriber Address'
      },
      {
        key: 'prescriber',
        key2: 'npi',
        header: 'Prescriber NPI'
      },
      {
        key: 'prescriber',
        key2: 'speciality',
        header: 'Prescriber Speciality'
      },
      {
        key: 'job_stage',
        header: 'Status'
      },
      {
        key: 'prescriber_name',
        header: 'Prescriber Name'
      },
      {
        key: 'product_advocate_name',
        header: 'Product Advocate Name'
      },
      {
        key: 'question_1__c',
        header: 'Was it a lunch meeting?'
      },
      {
        key: 'question_2__c',
        header: 'Who did you meet with?'
      },
      {
        key: 'question_3__c',
        header: 'Did you discuss how generic loop diuretics worsen bladder problems, especially in elderly patients?'
      },
      {
        key: 'question_4__c',
        header: 'Did you mention that many patients skip their diuretic dose because of worsening bladder problems?'
      },
      {
        key: 'question_5__c',
        header: 'Did mention that SOAANZ may help these patients and explain why?'
      },
      {
        key: 'question_6__c',
        header:
          'Did you request the physician or the person who you met to write “Dispense as Written” or “DAW” to avoid conversion to generic torsemide?'
      },
      {
        key: 'question_7A__c',
        header: 'Was there any clinical question that requires a follow-up?'
      },
      {
        key: 'question_7__c',
        header: 'Was there any clinical question that requires a follow-up?'
      },
      {
        key: 'question_8__c',
        header:
          'Did you inform the prescriber that SOAANZ can be purchased at a low fixed price from our mail order pharmacy? '
      },
      {
        key: 'question_9__c',
        header: 'Have you explained how a SOAANZ prescription can be sent to our mail order pharmacy?'
      },
      {
        key: 'question_10__c',
        header: 'Did you mention our 30-day free sample program?'
      },
      {
        key: 'question_11__c',
        header: 'Did you leave the promotional material with the person you met?'
      },
      {
        key: 'question_12A__c',
        header: 'Did you collect contact information of the person you met?'
      },
      {
        key: 'question_12B__c',
        header: 'Did you collect contact information of the person you met?'
      },
      {
        key: 'question_12C__c',
        header: 'Did you collect contact information of the person you met?'
      },
      {
        key: 'question_12__c',
        header: 'Did you collect contact information of the person you met?'
      },
      {
        key: 'question_13A__c',
        header: 'Have you scheduled a next visit?'
      },
      {
        key: 'question_13__c',
        header: 'Have you scheduled a next visit?'
      },
      {
        key: 'question_14__c',
        header: 'Write your personal observations'
      },
      {
        key: 'question_l_0__c',
        header: 'Date and Time'
      },
      {
        key: 'question_l_1A__c',
        header: 'How many people attended the lunch'
      },
      {
        key: 'question_l_1B__c',
        header: 'Names of persons (seperated by comma)'
      },
      {
        key: 'question_l_1C__c',
        header: 'How many physicians, NPs, and PAs?'
      },
      {
        key: 'question_l_1D__c',
        header: 'How many physicians, NPs, and PAs?'
      },
      {
        key: 'question_l_2__c',
        header: 'Total cost of lunch'
      },
      {
        key: 'question_l_4__c',
        header: 'Category'
      }
    ]

    csvDataArray.map(head => {
      csv += `${String(head['header'].replace(/,/g, ' '))},`
    })
    csv += `\n`

    data.map(job => {
      csvDataArray.map(item => {
        if ('key2' in item) {
          csv += `${String(job[item['key']][item.key2]).replace(/,|# |\n /gi, ' ')},`
        } else {
          csv += `${String(job[item['key']]).replace(/,|#|\n/gi, ' ')},`
        }
      })
      csv += `\n`
    })

    var hiddenElement = document.createElement('a')
    hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv)
    hiddenElement.target = '_blank'

    //provide the name for the CSV file to be downloaded
    hiddenElement.download = 'Data.csv'
    hiddenElement.click()
  }
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Filters' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Status</InputLabel>
                  <Select
                    fullWidth
                    value={store.jobs.filter.statusValue}
                    sx={{ mr: 4, mb: 2 }}
                    label='Status'
                    onChange={handleStatusValue}
                    labelId='status-select'
                  >
                    <MenuItem value=''>none</MenuItem>
                    <MenuItem value='Assigned'>Assigned</MenuItem>
                    <MenuItem value='Job cancelled'>Job cancelled</MenuItem>
                    <MenuItem value='Feedback completed'>Feedback completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    id='outlined-basic'
                    label='Product Advocate'
                    onChange={handleProductAdvocateValue}
                    value={store.jobs.filter.productAdvocateValue}
                  />
                </FormControl>
                {/* <FormControl fullWidth>
                  <InputLabel id='product-advocate'>Product Advocate</InputLabel>
                  <Select
                    fullWidth
                    value={store.jobs.filter.productAdvocateValue}
                    sx={{ mr: 4, mb: 2 }}
                    label='Product Advocate'
                    onChange={handleProductAdvocateValue}
                    labelId='product-advocate'
                  >
                    <MenuItem value=''>none</MenuItem>
                    {store.product_advocates.data
                      .filter(val => val.Active__c)
                      .map(val => {
                        return (
                          <MenuItem key={val.id} value={val.id}>
                            {val.name}
                          </MenuItem>
                        )
                      })}
                  </Select>
                </FormControl> */}
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePickerWrapper>
                  <DatePicker
                    isClearable
                    selectsRange
                    monthsShown={2}
                    endDate={store.jobs.filter.endDateRange}
                    selected={store.jobs.filter.startDateRange}
                    startDate={store.jobs.filter.startDateRange}
                    shouldCloseOnSelect={false}
                    id='date-range-picker-months'
                    onChange={handleOnChangeRange}
                    customInput={
                      <CustomInput
                        dates={store.jobs.filter.dates}
                        setDates={setDatesHandler}
                        label='Feedback submitted at'
                        end={store.jobs.filter.endDateRange}
                        start={store.jobs.filter.startDateRange}
                      />
                    }
                  />
                </DatePickerWrapper>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <FormControl fullWidth>
                  <TextField
                    value={meetWith}
                    id='outlined-basic'
                    label='Who Did You Meet With'
                    onChange={e => setMeetWith(e.target.value)}
                  />
                </FormControl> */}
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Who Did You Meet With</InputLabel>
                  <Select
                    fullWidth
                    value={store.jobs.filter.meet_with}
                    sx={{ mr: 4, mb: 2 }}
                    label='Status'
                    onChange={handleWhoDidYouMeetWith}
                    labelId='status-select'
                  >
                    <MenuItem value=''>Select Who Did You Meet With</MenuItem>
                    <MenuItem value='Front Desk'>Front Desk</MenuItem>
                    <MenuItem value='Madical Assistant'>Madical Assistant</MenuItem>
                    <MenuItem value='Nurse Practitioner (NP)'>Nurse Practitioner (NP)</MenuItem>
                    <MenuItem value='Physician'>Physician</MenuItem>
                    <MenuItem value='Office Manager'>Office Manager</MenuItem>
                    <MenuItem value='Physician’s Assistant'>Physician’s Assistant</MenuItem>
                  </Select>
                </FormControl>
                {/* <FormControl fullWidth>
                  <InputLabel id='status-select'>Who Did You Meet With</InputLabel>
                  <Select
                    fullWidth
                    value={store.jobs.filter.question_2__c}
                    sx={{ mr: 4, mb: 2 }}
                    label='Who Did You Meet With'
                    onChange={handleWhoDidYouMeetWith}
                    labelId='meet-with-select'
                    multiple
                  >
                    <MenuItem value=''>Select Who Did You Meet With</MenuItem>
                    <MenuItem value='Front Desk'>Front Desk</MenuItem>
                    <MenuItem value='Madical Assistant'>Madical Assistant</MenuItem>
                    <MenuItem value='Nurse Practitioner (NP)'>Nurse Practitioner (NP)</MenuItem>
                  </Select>
                </FormControl> */}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    value={store.jobs.filter.prescriberValue}
                    id='outlined-basic'
                    label='Prescriber'
                    onChange={handlePrescriberValue}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={store.jobs.filter.jobs_with_lunches_only == false}
                      onChange={(event, checked) =>
                        dispatch(
                          onJobFilterChangeHandler({
                            filter: 'jobs_with_lunches_only',
                            value: checked == true ? false : true
                          })
                        )
                      }
                    />
                  }
                  label='All Jobs'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={store.jobs.filter.jobs_with_lunches_only == true}
                      onChange={(event, checked) => {
                        setJobsWithLunches(checked)
                        if (checked == false) {
                          setJobsWithLunches(false)
                        }
                        dispatch(
                          onJobFilterChangeHandler({
                            filter: 'jobs_with_lunches_only',
                            value: checked == true ? true : false
                          })
                        )
                      }}
                    />
                  }
                  label='Jobs With Lunch'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={store.jobs.filter.revisits == true}
                      onChange={(event, checked) =>
                        dispatch(
                          onRevisitFilterChangeHandler({
                            filter: 'revisits',
                            value: checked == false ? false : true
                          })
                        )
                      }
                    />
                  }
                  label='Exclude Revisits'
                />
                {totalLunchSpent > 0 && (
                  <span>
                    Total Lunch Spent:
                    <b>
                      {'  '} ${totalLunchSpent}{' '}
                    </b>
                  </span>
                )}
              </Grid>
              {store.jobs.filter.statusValue == 'Feedback completed' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='status-select'>Radius</InputLabel>
                    <Select
                      fullWidth
                      value={store.jobs.filter.difference_location_doctor__c}
                      sx={{ mr: 4, mb: 2 }}
                      label='Status'
                      onChange={handleRadiusValue}
                      labelId='status-select'
                    >
                      <MenuItem value=''>Both</MenuItem>
                      <MenuItem value='within'>Within Radius</MenuItem>
                      <MenuItem value='outside'>Outside Radius</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeader onClick={() => toCSVForm(filteredRows)} />
          {/* <DataGrid
            autoHeight
            pagination
            rows={filteredRows}
            rowCount={store.jobs.totalRecords}
            columns={columns}
            disableSelectionOnClick
            pageSize={Number(pageSize)}
            rowsPerPageOptions={[10, 25, 50]}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          /> */}

          <DataGrid
            autoHeight
            pagination
            rows={isLoading ? [] : store.jobs.data}
            columns={columns}
            loading={isLoading}
            // checkboxSelection
            rowCount={store.jobs.totalRecords}
            disableSelectionOnClick
            pageSize={Number(pageSize)}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={newPage => {
              setPage(newPage)
            }}
            onSelectionModelChange={rows => setSelectedRow(rows)}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            paginationMode='server'
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default InvoiceList
