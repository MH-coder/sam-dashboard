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
import Close from 'mdi-material-ui/Close'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** Third Party Imports
import format from 'date-fns/format'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

// ** Styled Components
import { styled } from '@mui/material/styles'
import { convertDateToReadableFormat } from 'src/configs/utils'

import { cancelJob, onCancelJobHandler, onJobFilterChangeHandler } from 'src/store/jobs'
import Autocomplete from '@mui/material/Autocomplete'
import {
  cancelSampleData,
  fetchSamplesData,
  onSampleCancelHandler,
  onSampleFilterChangeHandler
} from 'src/store/samples'

import { fetchProductAdvocatesData } from 'src/store/product_advocates'
import SampleTableHeader from 'src/views/samples/SampleTableHeader'

import moment from 'moment'

/* eslint-enable */
const SamplesList = () => {
  // ** State
  const [pageSize, setPageSize] = useState(10)
  const [filteredRows, setFilteredRows] = useState([])

  const [prescribers, setPrescribers] = useState([])
  const [productAdvText, setProductAdvText] = useState('')
  const [selectedPrescriber, setSelectedPrescriber] = useState(undefined)
  const [status, setStatus] = useState('')

  const [total20Mg, setTotal20Mg] = useState(0)
  const [total60Mg, setTotal60Mg] = useState(0)

  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state)

  // useEffect(() => {
  //   if (store.samples.data.length <= pageSize * page) {
  //     setIsLoading(true)
  //     dispatch(fetchSamplesData({ page_num: page, page_size: pageSize })).then(() => {
  //       setIsLoading(false)
  //     })
  //   }
  // }, [pageSize, page])

  useEffect(() => {
    const fetchData = async () => {
      console.log('Filter', store.samples.filter)

      setIsLoading(true)
      await dispatch(
        fetchSamplesData({
          page_num: page + 1,
          page_size: pageSize,
          product_advocate: store.samples.filter.productAdvocateValue,
          prescriber: store.samples.filter.prescriberValue,
          sample_status: store.samples.filter.Status__c
        })
      )
      setIsLoading(false)
    }
    if (store.samples.totalRecords) {
      if (pageSize * (page + 1) > store.samples.totalRecords) {
        const Remain = pageSize * (page + 1) - store.samples.totalRecords
        const RemainPageSize = pageSize - Remain
        dispatch(
          fetchSamplesData({
            page_num: page + 1,
            page_size: RemainPageSize,
            product_advocate: store.samples.filter.productAdvocateValue,
            prescriber: store.samples.filter.prescriberValue,
            sample_status: store.samples.filter.Status__c
          })
        ).then(() => {
          fetchData()
        })
      } else {
        fetchData()
      }
    } else {
      fetchData()
    }
  }, [page, pageSize, store.samples.filter])

  useEffect(() => {
    onFilterChangeHandler()
  }, [store.samples.data, store.samples.filter, selectedPrescriber])

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

  const onFilterChangeHandler = () => {
    const { productAdvocateValue, Status__c } = store.samples.filter
    const data = store.samples.data
    if (Boolean(productAdvocateValue)) {
      data = data.filter(val => {
        try {
          return val.Product_Advocate__r.Id == productAdvocateValue
        } catch (e) {
          return false
        }
      })
    }

    if (selectedPrescriber) {
      data = data.filter(val => {
        try {
          return val.Prescriber__r.Id == selectedPrescriber
        } catch (e) {
          return false
        }
      })
    }

    if (Boolean(Status__c)) {
      data = data.filter(val => val.Status__c == Status__c)
    }

    let twentyMGTotal = 0
    let sixtyMGTotal = 0

    data.forEach(d => {
      if (d.Status__c == 'delivered') {
        twentyMGTotal += isNaN(d.Quantity_20__c) ? 0 : d.Quantity_20__c
        sixtyMGTotal += isNaN(d.Quantity_60__c) ? 0 : d.Quantity_60__c
      }
    })

    setTotal20Mg(store.samples.delivered_mg_20)
    setTotal60Mg(store.samples.delivered_mg_60)

    setFilteredRows(data)
  }

  const handleChangePrescriberValue = e => {
    dispatch(onSampleFilterChangeHandler({ filter: 'prescriberValue', value: e.target.value }))
  }

  const handleChangeProductAdvocateValue = e => {
    dispatch(onSampleFilterChangeHandler({ filter: 'productAdvocateValue', value: e.target.value }))
  }

  const handleChangeStatusValue = e => {
    dispatch(onSampleFilterChangeHandler({ filter: 'Status__c', value: e.target.value }))
  }

  const StyledLink = styled('a')(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.primary.main
  }))

  const cancelSample = async id => {
    try {
      const _ = dispatch(
        cancelSampleData({
          id: id
        })
      )
      let data = store.samples.data.map(row => Object.assign({}, row))
      const findIndex = data.findIndex(row => row.Id == id)
      data[findIndex].Status__c = 'cancelled'
      dispatch(onSampleCancelHandler(data))
    } catch (e) {
      console.log(e, 'err')
      alert('Something went wrong. Try again later.')
    }
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
              cancelSample(row.Id)
              handleRowOptionsClose()
            }}
          >
            <Close sx={{ fontSize: '1rem', fontWeight: '800' }} /> Cancel Sample
          </MenuItem>
        </Menu>
      </Fragment>
    )
  }

  const jobsListViewColumns = [
    {
      field: 'Id',
      minWidth: 200,
      headerName: 'id',
      renderCell: ({ row }) => (
        <Link href={`/samples/preview/${row.Id}`} passHref>
          <StyledLink>{`${row.Id}`}</StyledLink>
        </Link>
      )
    },
    {
      flex: 0.3,
      field: 'Quantity_20__c',
      minWidth: 20,
      headerName: '20 MG',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='caption'>
                {row.Quantity_20__c}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.3,
      field: 'Quantity_60__c',
      minWidth: 20,
      headerName: '60 MG',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='caption'>
                {row.Quantity_60__c}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.4,
      minWidth: 150,
      field: 'feedback_submitted_at__c',
      headerName: 'Prescriber',
      renderCell: ({ row }) => (
        <Link href={`/prescribers/preview/${row.Prescriber__r.Id}`} passHref>
          <StyledLink>{`${row.Prescriber_Name__c}`}</StyledLink>
        </Link>
      )
    },
    {
      flex: 0.4,
      minWidth: 70,
      field: 'difference_location_doctor__c',
      headerName: 'product Advocate',
      renderCell: ({ row }) => {
        return (
          <Link href={`/product_advocates/preview/${row.Product_Advocate__r.Id}`} passHref>
            <StyledLink style={{ textTransform: 'uppercase' }}>{`${row.Product_Advocate__r.Name}`}</StyledLink>
          </Link>
        )
      }
    },
    {
      flex: 0.3,
      minWidth: 70,
      field: 'Pre_Sign_Date__c',
      headerName: 'Request Date ',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='caption'>
                {moment(row.Pre_Sign_Date__c).format('YYYY-MM-DD')}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.3,
      minWidth: 70,
      field: 'Post_Sign_Date__c',
      headerName: 'Deliver Date',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='caption'>
                {String(row.Post_Sign_Date__c) != 'null' ? moment(row.Post_Sign_Date__c).format('YYYY-MM-DD') : 'N.A.'}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 70,
      field: 'Status__c',
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='caption'>
                {row.Status__c || ''}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 70,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='View'>
            <Box>
              <Link href={`/samples/preview/${row.Id}`} passHref>
                <IconButton size='small' component='a' sx={{ textDecoration: 'none' }}>
                  <EyeOutline fontSize='small' />
                </IconButton>
              </Link>
            </Box>
          </Tooltip>
          {row.Status__c == 'requested' && <RowOptions row={row} />}
        </Box>
      )
    }
  ]
  const columns = [...jobsListViewColumns]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Filters' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    value={store.samples.filter.productAdvocateValue}
                    id='outlined-basic'
                    label='Product Advocate'
                    onChange={handleChangeProductAdvocateValue}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} mb={4}>
                <FormControl fullWidth>
                  <TextField
                    value={store.samples.filter.prescriberValue}
                    id='outlined-basic'
                    label='Prescriber'
                    onChange={handleChangePrescriberValue}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='product-advocate-s'>Sample Status</InputLabel>
                  <Select
                    fullWidth
                    value={store.samples.filter.Status__c}
                    sx={{ mr: 4, mb: 2 }}
                    label='Sample Status'
                    onChange={handleChangeStatusValue}
                    labelId='product-advocate-s'
                  >
                    <MenuItem value=''>All</MenuItem>
                    <MenuItem value={'requested'}>{'Requested'}</MenuItem>
                    <MenuItem value={'cancelled'}>{'Cancelled'}</MenuItem>
                    <MenuItem value={'delivered'}>{'Delivered'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption' sx={{ fontWeight: 600 }}>
                  Total - 20 MG (Delivered) :
                </Typography>
                <small>
                  <b>{'  ' + total20Mg}</b>
                </small>
                <br />
                <Typography variant='caption' sx={{ fontWeight: 600 }}>
                  Total - 60 MG (Delivered) :
                </Typography>
                <small>
                  <b>{'  ' + total60Mg}</b>
                </small>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <SampleTableHeader />
          {/* <DataGrid
            getRowId={row => row.Id}
            autoHeight
            pagination
            rows={filteredRows}
            columns={columns}
            disableSelectionOnClick
            pageSize={Number(pageSize)}
            rowsPerPageOptions={[10, 25, 50]}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          /> */}

          <DataGrid
            autoHeight
            pagination
            rows={isLoading ? [] : store.samples.data}
            columns={columns}
            loading={isLoading}
            getRowId={row => row.Id}
            // checkboxSelection
            rowCount={store.samples.totalRecords}
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

export default SamplesList
