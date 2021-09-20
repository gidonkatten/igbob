import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import DescriptionIcon from '@material-ui/icons/Description';
import ListIcon from '@material-ui/icons/List';
import { convertUnixTimeToDate, convertUnixTimeToTime } from '../utils/Utils';
import Rating from '@material-ui/lab/Rating';
import { AppFiles } from '../redux/types';

interface IPFSFileListProps {
  cids: AppFiles,
  ratings: Uint8Array,
  startBuyDate: number,
  endBuyDate: number,
  bondLength: number,
  maturityDate: number
  period: number
}

export function IPFSFileList(props: IPFSFileListProps) {

  const {
    cids,
    ratings,
    startBuyDate,
    endBuyDate,
    period
  } = props;

  const [open, setOpen] = React.useState<boolean[]>(new Array(cids.length).fill(false));

  const handleClick = (index: number) => {
    const newOpen: boolean[] = [...open];
    newOpen[index] = !open[index];
    setOpen(newOpen);
  };

  return (
    <div>
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
      >

        {cids.map((roundCids: { cid: string, time: number }[], round: number) => {
          return (
            <div
              key={round}
              title={ratings[round] === 0 ? 'No rating yet' : ('Rated ' + ratings[round] + ' stars')}
            >

              <ListItem button onClick={() => handleClick(round)}>
                <ListItemIcon><ListIcon/></ListItemIcon>
                <ListItemText
                  primary={round === 0 ?
                    "Use of proceeds: - " + convertUnixTimeToDate(startBuyDate):
                    "Report " + round + ": " + convertUnixTimeToDate(endBuyDate + (round - 1) * period) + " - " + convertUnixTimeToDate(endBuyDate + round * period)
                  }
                />

                <Rating
                  name="read-only"
                  size="large"
                  value={ratings.length === 0 ? 0 : ratings[round]}
                  style={{ paddingRight: '16px' }}
                  disabled={ratings[round] === 0}
                  readOnly
                />

                {open[round] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              <Collapse in={open[round]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                  {roundCids.map((cid: { cid: string, time: number }, index: number) => {
                    return (
                      <ListItem
                        key={index}
                        button
                        title={"Uploaded: " + convertUnixTimeToDate(cid.time) + " " + convertUnixTimeToTime(cid.time)}
                        style={{ paddingLeft: '54px' }}
                      >
                        <ListItemIcon><DescriptionIcon/></ListItemIcon>
                        <ListItemText
                          primary={
                            <a
                              href={"https://ipfs.io/ipfs/" + cid.cid}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              https://ipfs.io/ipfs/{cid.cid}
                            </a>
                          }
                        />
                      </ListItem>
                    )
                  })}

                  {roundCids.length === 0 && (
                    <ListItem button style={{ paddingLeft: '54px' }}>
                      <ListItemText primary="No files uploaded"/>
                    </ListItem>
                  )}

                </List>
            </Collapse>

            </div>
          )
        })}

      </List>
    </div>
  )
}
