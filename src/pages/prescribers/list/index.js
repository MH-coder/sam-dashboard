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
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import Select from '@mui/material/Select'

// ** Icons Imports
import Send from 'mdi-material-ui/Send'
import Check from 'mdi-material-ui/Check'
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
import Snackbar from '@mui/material/Snackbar'
// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchPrescribersData } from 'src/store/prescribers'
import { debounce } from 'lodash'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import TableHeader from 'src/views/apps/invoice/list/TableHeader'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { onPrescriberFilterChangeHandler } from 'src/store/prescribers'
import PrescriberEditDialog from './edit-dialog'
import EditIcon from 'mdi-material-ui/Pencil'
import { Checkbox } from '@mui/material'
// import EditIcon from '@mui/icons-material/Edit';

// ** Styled component for the link in the dataTable
const StyledLink = styled('a')(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const RowOptions = ({ id }) => {
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
        <MenuItem>
          <Download fontSize='small' sx={{ mr: 2 }} />
          Download
        </MenuItem>
        <Link href={`/apps/invoice/edit/${id}`} passHref>
          <MenuItem>
            <PencilOutline fontSize='small' sx={{ mr: 2 }} />
            Edit
          </MenuItem>
        </Link>
        <MenuItem>
          <ContentCopy fontSize='small' sx={{ mr: 2 }} />
          Duplicate
        </MenuItem>
      </Menu>
    </Fragment>
  )
}
/* eslint-enable */
const InvoiceList = () => {
  // ** State
  const [dates, setDates] = useState([])
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [statusValue, setStatusValue] = useState('')
  const [endDateRange, setEndDateRange] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [startDateRange, setStartDateRange] = useState(new Date())
  const [states, setStates] = useState([])
  const [open, setOpen] = useState(false)
  const [prescriber, setPrescriber] = useState({})
  const [presName, setPresName] = useState('')
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState('')
  const [isSoaanz, setIsSoaanz] = useState('')

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state)

  useEffect(() => {
    setIsLoading(true)
    console.log('Filter Check', store.prescribers.filter)
    const fetchPrescribersDataWithDebounce = debounce(() => {
      dispatch(
        fetchPrescribersData({
          page_num: page + 1,
          page_size: pageSize,
          name: store.prescribers.filter.name,
          state: store.prescribers.filter.State__c,
          is_soaanz_prescriber: store.prescribers.filter.is_soaanz_prescriber__c
        })
      ).then(() => {
        filterAllStates()
        setIsLoading(false)
      })
    }, 2000)

    fetchPrescribersDataWithDebounce()

    return fetchPrescribersDataWithDebounce.cancel
  }, [page, pageSize, store.prescribers.filter])

  const filterAllStates = () => {
    var state = []
    console.log()
    store.prescribers.data.forEach(pres => {
      const index = state.findIndex(st => st == pres.State__c)
      if (index == -1) {
        state.push(pres.State__c)
      }
    })
    setStates(state)
  }

  const handleFilter = val => {
    setValue(val)
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDates(dates)
    }
    setStartDateRange(start)
    setEndDateRange(end)
  }

  const handleStateChangeHandler = e => {
    dispatch(onPrescriberFilterChangeHandler({ filter: 'State__c', value: e.target.value }))
  }

  const handleSoaanzStateChangeHandler = e => {
    dispatch(onPrescriberFilterChangeHandler({ filter: 'is_soaanz_prescriber__c', value: e.target.value }))
  }

  const handlePrescriberNameChangeHandler = e => {
    dispatch(onPrescriberFilterChangeHandler({ filter: 'name', value: e.target.value }))
  }

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     dispatch(onPrescriberFilterChangeHandler({ filter: 'name', value: presName }))
  //   }, 500)
  //   return () => clearTimeout(delayDebounceFn)
  // }, [presName])

  const defaultColumns = [
    {
      field: 'name',
      minWidth: 200,
      headerName: 'Name',
      renderCell: ({ row }) => (
        <Link href={`/prescribers/preview/${row.id}`} passHref>
          <StyledLink>{`${row?.name}`}</StyledLink>
        </Link>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'prescriber_address',
      headerName: 'Address',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.prescriber_address || ''}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'Speciality__c',
      headerName: 'Speciality',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.Speciality__c || ''}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'furosemide_trx',
      headerName: 'Furosemide trx',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.furosemide_trx || ''}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'is_soaanz_prescriber__c',
      headerName: 'Is Writing Soaanz',
      renderCell: ({ row }) => (
        <Typography variant='body2'>
          {' '}
          <Checkbox checked={row?.is_soaanz_prescriber__c ? true : false} disabled />
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'market_decile',
      headerName: 'Market Decile',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.market_decile || ''}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'market_decile',
      headerName: 'Edit',
      renderCell: ({ row }) => (
        <EditIcon
          onClick={() => {
            setPrescriber(row), setOpen(true)
          }}
        />
      )
    }
  ]
  const columns = [...defaultColumns]

  const filterPrescriber = prescriber => {
    const state = store.prescribers.filter.State__c
    const name = store.prescribers.filter.name
    const soaanzPresc = store.prescribers.filter.is_soaanz_prescriber__c

    // console.log(soaanzPresc)
    let returnValue = true
    // if (Boolean(name) && !Boolean(state)) {
    //   return prescriber.name.toLowerCase().indexOf(name.toLowerCase()) != -1
    // } else if (Boolean(state) && !Boolean(name)) {
    //   return state == prescriber.State__c
    // } else if (Boolean(state) && Boolean(name)) {
    //   return state == prescriber.State__c && prescriber.name.includes(name)
    // } else {
    //   return true
    // }

    if (Boolean(name)) {
      returnValue = prescriber.name.toLowerCase().indexOf(name.toLowerCase()) != -1
    }
    if (Boolean(state)) {
      returnValue = state == prescriber.State__c
    }
    if (Boolean(soaanzPresc)) {
      // console.log(soaanzPresc);
      if (soaanzPresc === 'true') {
        returnValue = prescriber.is_soaanz_prescriber__c
      } else {
        // console.log("asdfasdfasdf");
        returnValue = !prescriber.is_soaanz_prescriber__c
      }

      // if(soaanzPresc ){
      //   // console.log("INSIDE FILTER", soaanzPresc, prescriber.is_soaanz_prescriber__c);
      //   returnValue = prescriber.is_soaanz_prescriber__c;
      // }else{

      // }

      // returnValue = soaanzPresc == prescriber.is_soaanz_prescriber__c
    }
    // if()

    return returnValue
  }

  const [snackOpen, setSnackOpen] = useState(false)
  return (
    <Grid container spacing={6}>
      <PrescriberEditDialog
        prescriber={prescriber}
        onPrescriberUpdate={() => {
          setSnackOpen(true)
          setOpen(false)
        }}
        open={open}
        handleClose={handleClose}
      />
      <Snackbar
        open={snackOpen}
        onClose={() => setSnackOpen(false)}
        message='Address updated successfully.'
        autoHideDuration={3000}
        anchorOrigin={{ horizontal: 'top', vertical: 'center' }}
      />
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Filters' />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={6} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>State</InputLabel>
                  <Select
                    fullWidth
                    value={store.prescribers.filter.State__c}
                    sx={{ mr: 4, mb: 2 }}
                    label='State'
                    onChange={handleStateChangeHandler}
                    labelId='meet-with-select'
                  >
                    <MenuItem value=''>Select State</MenuItem>
                    {states &&
                      states.map((item, index) => (
                        <MenuItem key={`state-${index}`} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    value={store.prescribers.filter.name}
                    id='outlined-basic'
                    label='Prescriber Name'
                    onChange={handlePrescriberNameChangeHandler}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Is Soaanz Prescriber</InputLabel>
                  <Select
                    fullWidth
                    value={store.prescribers.filter.is_soaanz_prescriber__c}
                    sx={{ mr: 4, mb: 2 }}
                    label='State'
                    onChange={handleSoaanzStateChangeHandler}
                    labelId='meet-with-select'
                  >
                    <MenuItem value=''>Select State</MenuItem>
                    <MenuItem value='true'>Yes</MenuItem>
                    <MenuItem value='false'>Not</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          {/* <TableHeader value={value} selectedRows={selectedRows} handleFilter={handleFilter} /> */}
          <DataGrid
            autoHeight
            pagination
            rows={isLoading ? [] : store.prescribers.data}
            columns={columns}
            loading={isLoading}
            // checkboxSelection
            rowCount={store.prescribers.totalRecords}
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
