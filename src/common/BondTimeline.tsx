import React from 'react';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import GavelIcon from '@material-ui/icons/Gavel';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import { convertUnixTimeToDate, convertUnixTimeToTime } from '../utils/Utils';
import { CouponRound, getCouponRound } from '../investor/Utils';

interface BondTimelineProps {
  startBuyDate: number,
  endBuyDate: number,
  bondLength: number,
  maturityDate: number
  period: number
}

export default function bondTimeline(props: BondTimelineProps) {
  const {
    startBuyDate,
    endBuyDate,
    bondLength,
    maturityDate,
    period
  } = props;

  const couponRound: CouponRound = getCouponRound(endBuyDate, maturityDate, period, bondLength);

  return (
    <Timeline align={'alternate'}>

      {/*START BUY*/}
      <TimelineItem>

        <TimelineOppositeContent>
          <Typography
            variant="body2"
            color="textSecondary"
            title={convertUnixTimeToTime(startBuyDate)}
          >
            {convertUnixTimeToDate(startBuyDate)}
          </Typography>
        </TimelineOppositeContent>

        <TimelineSeparator>
          <TimelineDot><PlayArrowIcon/></TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>

        <TimelineContent>
          <Paper elevation={3} className={'timeline-box'}>
            <Typography variant="h6" component="h1">Start buy date</Typography>
            <Typography>When you can purchase the bond</Typography>
          </Paper>
        </TimelineContent>

      </TimelineItem>

      {/*END BUY*/}
      <TimelineItem>

        <TimelineOppositeContent>
          <Typography
            variant="body2"
            color="textSecondary"
            title={convertUnixTimeToTime(endBuyDate)}
          >
            {convertUnixTimeToDate(endBuyDate)}
          </Typography>
        </TimelineOppositeContent>

        <TimelineSeparator>
          <TimelineDot color="secondary"><GavelIcon/></TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>

        <TimelineContent>
          <Paper elevation={3} className={'timeline-box'}>
            <Typography variant="h6" component="h1">End buy date</Typography>
            <Typography>When you can no longer purchase the bond</Typography>
          </Paper>
        </TimelineContent>

      </TimelineItem>

      {/*COUPONS*/}
      <TimelineItem>

        <TimelineOppositeContent>
          <Typography variant="body2" color="textSecondary">
            {convertUnixTimeToDate(endBuyDate + period)} - {convertUnixTimeToDate(endBuyDate + period * bondLength)}
          </Typography>
        </TimelineOppositeContent>

        <TimelineSeparator>
          <TimelineDot color="primary"><LocalOfferIcon/></TimelineDot>
          <TimelineConnector/>
        </TimelineSeparator>

        <TimelineContent>
          <Paper elevation={3} className={'timeline-box'}>
            <Typography variant="h6" component="h1">Coupon payments</Typography>
            <Typography>
              These are payable every {period} seconds <br/>
              There are {bondLength - Math.min(bondLength, couponRound.round)} upcoming coupon payments<br/>
              {couponRound.round < bondLength ?
                <>The next coupon date is {convertUnixTimeToDate(couponRound.date + period)}</> :
                null
              }
            </Typography>
          </Paper>
        </TimelineContent>
      </TimelineItem>

      {/*MATURITY*/}
      <TimelineItem>

        <TimelineOppositeContent>
          <Typography
            variant="body2"
            color="textSecondary"
            title={convertUnixTimeToTime(maturityDate)}
          >
            {convertUnixTimeToDate(maturityDate)}
          </Typography>
        </TimelineOppositeContent>

        <TimelineSeparator>
          <TimelineDot style={{ backgroundColor: 'green' }}><MonetizationOnIcon/></TimelineDot>
        </TimelineSeparator>

        <TimelineContent>
          <Paper elevation={3} className={'timeline-box'}>
            <Typography variant="h6" component="h1">Maturity date</Typography>
            <Typography>When you can claim the coupon</Typography>
          </Paper>
        </TimelineContent>

      </TimelineItem>

    </Timeline>
  );
}
