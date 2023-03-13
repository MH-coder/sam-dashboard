import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import moment from 'moment/moment'

// ** MUI Imports
import Grid from '@mui/material/Grid'

import RechartsLineChart from 'src/views/charts/recharts/RechartsLineChart'
import RechartsPieChart from 'src/views/charts/recharts/RechartsPieChart'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import RechartsWrapper from 'src/@core/styles/libs/recharts'

import CrmStatisticsCard from 'src/views/dashboard/CrmStatisticsCard'
import { check } from 'prettier'
import { fetchDashboardData } from 'src/store/prescribers'

const CRMDashboard = () => {
  const [states, setStates] = useState([])
  const [jobs, setJobs] = useState([])
  const [samples, setSamples] = useState([])
  const [visits, setVisits] = useState([])
  const [dashboardData, setDashboardData] = useState([])
  const [seed, setSeed] = useState(1)

  //Storing Data in an Array for Further Manipulation
  const store = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    setStates(store.prescribers.data)
  }, [store.prescribers.data])

  useEffect(() => {
    setSamples(store.samples.data)
  }, [store.samples.data])

  useEffect(() => {
    setJobs(store.jobs.data)
  }, [store.jobs.data])

  useEffect(() => {
    setSeed(Math.random())
  }, [dashboardData.result?.records[0]])

  useEffect(() => {
    dispatch(fetchDashboardData()).then(() => {})
  }, [])

  useEffect(() => {
    setDashboardData(store.prescribers.dashboardData)
  }, [store.prescribers.dashboardData])

  let arr = []
  jobs.filter(name => {
    arr.push(name.prescriber_name)
  })
  // console.log('Total Number of Prescribers', arr.length)

  //filterig all unique Prescribers Name out of all Prescribers
  let uniqueArray = []
  for (let i = 0; i < arr.length; i++) {
    if (!uniqueArray.includes(arr[i])) {
      uniqueArray.push(arr[i])
    }
  }

  // Number of Presubscribers Covered
  const PrescribersCovered = dashboardData.result?.visited_count[0].expr0

  // console.log('Number of Prescribers Covered', dashboardData?.result.visited_count[0].expr0)

  // Number of Presubscribers who has more than one repeat visits
  const nonUniqueDoc = arr.filter(function (item, index) {
    return arr.indexOf(item) !== index
  })
  const repeatVisit = dashboardData?.result?.revisited_count?.totalSize
  // console.log('Number of Prescribers of Repeate Visits', repeatVisit)
  // Number of Presubscribers
  const totalPresubscribers = states.length
  // console.log('Total Prescribers', totalPresubscribers)

  let fd_Count = dashboardData.result?.records[0].expr0 + dashboardData.result?.records[7].expr0
  let md_Count = dashboardData.result?.records[1].expr0
  let nurse_Count = dashboardData.result?.records[2].expr0
  let np_Count = dashboardData.result?.records[3].expr0
  let om_Count = dashboardData.result?.records[4].expr0
  let ph_Count = dashboardData.result?.records[5].expr0
  let pa_Count = dashboardData.result?.records[6].expr0

  let lm_Count = dashboardData.result?.lunch_meetings

  jobs.map(jobItem => {
    if (jobItem.question_2__c == 'Front Desk Staff') {
      fd_Count++
    }
    if (jobItem.question_2__c == 'Medical Assistant (MA)') {
      md_Count++
    }
    if (jobItem.question_2__c == 'Physician') {
      ph_Count++
    }

    if (jobItem.question_2__c == 'Office Manager') {
      om_Count++
    }
    if (jobItem.question_2__c == 'Physician’s Assistant (PA)') {
      pa_Count++
    }
    if (jobItem.question_2__c == 'Nurse Practitioner (NP)') {
      np_Count++
    }
    if (jobItem.question_1__c) {
      lm_Count++
    }
  })

  // console.log("Lunch Count",lm_Count)

  //# of samples distributed and there amount in $
  let c_20_Delived_Count = 0
  let c_60_Delived_Count = 0
  samples.map(sampleData => {
    if (sampleData.Status__c == 'delivered') {
      c_20_Delived_Count += sampleData.Quantity_20__c
      c_60_Delived_Count += sampleData.Quantity_60__c
    }
  })
  // console.log('20_c Delivered Count', c_20_Delived_Count)
  // console.log('60_c Delivered Count', c_60_Delived_Count)

  let DollarAmount_c20 = c_20_Delived_Count * 50
  let DollarAmount_c60 = c_60_Delived_Count * 100
  // console.log('20_c in $', DollarAmount_c20)
  // console.log('60_c in $', DollarAmount_c60)

  function getMonthRanges() {
    const monthRanges = []
    for (let i = 0; i < 6; i++) {
      if (i == 0) {
        const startOfMonth = moment().subtract(i, 'month').startOf('month').format('YYYY/MM/DD')
        const currentDate = moment().format('YYYY/MM/DD')
        const monthName = moment(startOfMonth).format('MMM')
        monthRanges.push({ start: startOfMonth, end: currentDate, month: monthName })
      } else {
        const startOfMonth = moment().subtract(i, 'month').startOf('month').format('YYYY/MM/DD')
        const endOfMonth = moment().subtract(i, 'month').endOf('month').format('YYYY/MM/DD')
        const monthName = moment(startOfMonth).format('MMM')
        monthRanges.push({ start: startOfMonth, end: endOfMonth, month: monthName })
      }
    }
    return monthRanges
  }

  const monthRange = getMonthRanges()

  // console.log(monthRange)

  // Finding Doctor visited per month
  var t0 = dashboardData.result?.visitedPerMonth[1].totalCount
  var t1 = dashboardData.result?.visitedPerMonth[0].totalCount
  var t2 = dashboardData.result?.visitedPerMonth[6].totalCount
  var t3 = dashboardData.result?.visitedPerMonth[5].totalCount
  var t4 = dashboardData.result?.visitedPerMonth[4].totalCount
  var t5 = dashboardData.result?.visitedPerMonth[3].totalCount

  // jobs.map(item => {
  //   const formatedDate = moment(item.CreatedDate).format('YYYY/MM/DD')
  //   if (formatedDate >= monthRange[0].start && formatedDate <= monthRange[0].end) {
  //     t0++
  //   }
  //   if (formatedDate >= monthRange[1].start && formatedDate <= monthRange[1].end) {
  //     t1++
  //   }
  //   if (formatedDate >= monthRange[2].start && formatedDate <= monthRange[2].end) {
  //     t2++
  //   }
  //   if (formatedDate >= monthRange[3].start && formatedDate <= monthRange[3].end) {
  //     t3++
  //   }
  //   if (formatedDate >= monthRange[4].start && formatedDate <= monthRange[4].end) {
  //     t4++
  //   }
  //   if (formatedDate >= monthRange[5].start && formatedDate <= monthRange[5].end) {
  //     t5++
  //   }
  // })
  monthRange[0].visit = t0
  monthRange[1].visit = t1
  monthRange[2].visit = t2
  monthRange[3].visit = t3
  monthRange[4].visit = t4
  monthRange[5].visit = t5

  const data = [
    {
      title: 'Revisited',
      color: 'primary'
      // icon: <TrendingUp sx={{ fontSize: '1.75rem' }} />
    },
    {
      title: 'Samples',
      color: 'success'
      // icon: <AccountOutline sx={{ fontSize: '1.75rem' }} />
    },
    {
      color: 'warning',
      title: 'Lunch Meetings'
      // icon: <CellphoneLink sx={{ fontSize: '1.75rem' }} />
    }
  ]

  data[0].stats = repeatVisit
  data[1].stats = dashboardData.result?.delivered_mg_20[0].expr0 + dashboardData.result?.delivered_mg_60[0].expr0 || ''
  data[2].stats = lm_Count

  const bestAdvData = [
    {
      title: 'Total Visits',
      color: 'primary',
      stats: 20
      // icon: <TrendingUp sx={{ fontSize: '1.75rem' }} />
    }
  ]
  // console.log(bestAdvData)

  let bestProductAdvocate = []
  let visitCount = 0
  if (jobs.length !== 0) {
    const filterObjArray = []
    jobs.filter(job => {
      const formatedDate = moment(job.CreatedDate).format('YYYY/MM/DD')
      if (
        formatedDate >= moment().subtract(8, 'days').format('YYYY/MM/DD') &&
        formatedDate <= moment().subtract(1, 'days').format('YYYY/MM/DD')
      ) {
        filterObjArray.push(job)
      }
    })

    let objectCount = filterObjArray.reduce((counts, object) => {
      counts[object.product_advocate.id] = (counts[object.product_advocate.id] || 0) + 1
      return counts
    }, {})
    let maxCount = Math.max(...Object.values(objectCount))
    visitCount = maxCount
    let mostRepeatedObject = jobs.filter(object => objectCount[object.product_advocate.id] === maxCount)

    // bestProductAdvocate = mostRepeatedObject[0].product_advocate
    // console.log('Best', bestProductAdvocate)
  }
  const bestAdvName = dashboardData.result?.best_product_advocate[0].Name || ''
  bestAdvData[0].stats = dashboardData.result?.best_product_advocate[0].expr0

  return (
    <>
      <ApexChartWrapper>
        <Grid container rowSpacing={1} columnSpacing={1}>
          <Grid item xs={12} md={6}>
            <CrmStatisticsCard
              title={'Prescriber'}
              header={`Total ${PrescribersCovered} Prescribers Visited`}
              dataObj={data}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CrmStatisticsCard title={'Product Advocate of The Week'} header={`${bestAdvName}`} dataObj={bestAdvData} />
          </Grid>
        </Grid>
      </ApexChartWrapper>
      <div style={{ marginTop: '5px' }}>
        <RechartsWrapper>
          <Grid container rowSpacing={1} columnSpacing={1}>
            <Grid item xs={12} md={6}>
              <RechartsLineChart visitMonthly={monthRange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RechartsPieChart
                fd={fd_Count}
                ma={md_Count}
                nurse={nurse_Count}
                np={np_Count}
                ph={ph_Count}
                om={om_Count}
                pa={pa_Count}
                key={seed}
              />
            </Grid>
          </Grid>
        </RechartsWrapper>
      </div>
    </>
  )
}

export default CRMDashboard
