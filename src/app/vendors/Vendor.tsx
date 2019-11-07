import React from 'react';
import { D2ManifestDefinitions } from '../destiny2/d2-definitions';
import BungieImage from '../dim-ui/BungieImage';
import Countdown from '../dim-ui/Countdown';
import VendorItems from './VendorItems';
import CollapsibleTitle from '../dim-ui/CollapsibleTitle';
import { D2Vendor } from './d2-vendors';
import styles from './Vendor.m.scss';
import _ from 'lodash';
import { VendorDrop, VendorDropType } from 'app/vendorEngramsXyzApi/vendorDrops';
import { getVendorDropsForVendor } from 'app/vendorEngramsXyzApi/vendorEngramsXyzService';
import { t } from 'i18next';
import vendorEngramSvg from '../../images/engram.svg';
import clsx from 'clsx';

/**
 * An individual Vendor in the "all vendors" page. Use SingleVendor for a page that only has one vendor on it.
 */
export default function Vendor({
  vendor,
  defs,
  ownedItemHashes,
  currencyLookups,
  filtering,
  allVendorEngramDrops
}: {
  vendor: D2Vendor;
  defs: D2ManifestDefinitions;
  ownedItemHashes?: Set<number>;
  currencyLookups: {
    [itemHash: number]: number;
  };
  filtering: boolean;
  allVendorEngramDrops?: VendorDrop[];
}) {
  const placeString = _.uniq(
    [
      vendor.destination && vendor.destination.displayProperties.name,
      vendor.place && vendor.place.displayProperties.name
    ].filter((n) => n && n.length)
  ).join(', ');

  const vendorEngramDrops = $featureFlags.vendorEngrams
    ? getVendorDropsForVendor(vendor.def.hash, allVendorEngramDrops)
    : [];
  const dropActive = vendorEngramDrops.some((vd) => vd.drop === VendorDropType.DroppingHigh);

  const vendorLinkTitle = dropActive ? 'VendorEngramsXyz.Likely380' : 'VendorEngramsXyz.Vote';

  return (
    <div id={vendor.def.hash.toString()}>
      <CollapsibleTitle
        className={styles.title}
        title={
          <>
            {$featureFlags.vendorEngrams && vendorEngramDrops.length > 0 && (
              <a target="_blank" rel="noopener" href="https://vendorengrams.xyz/">
                <img
                  className={clsx('fa', 'xyz-engram', { 'xyz-active-throb': dropActive })}
                  src={vendorEngramSvg}
                  title={t(vendorLinkTitle)}
                />
              </a>
            )}
            <BungieImage src={vendor.def.displayProperties.icon} className={styles.icon} />
            <div className={styles.titleDetails}>
              <div>{vendor.def.displayProperties.name}</div>
              <div className={styles.location}>{placeString}</div>
            </div>
          </>
        }
        extra={
          vendor.component && <Countdown endTime={new Date(vendor.component.nextRefreshDate)} />
        }
        sectionId={`d2vendor-${vendor.def.hash}`}
      >
        <VendorItems
          defs={defs}
          vendor={vendor}
          ownedItemHashes={ownedItemHashes}
          currencyLookups={currencyLookups}
          filtering={filtering}
        />
      </CollapsibleTitle>
    </div>
  );
}
