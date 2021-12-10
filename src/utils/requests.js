import axios from "axios";
import { makeFilterBody } from "pages/Explore/utils/hooks/useStacFilter";
import { collectionFilter } from "pages/Explore/utils/stac";
import { useQuery, useQueries } from "react-query";
import { makeTileJsonUrl } from "utils";
import { DATA_URL, STAC_URL } from "./constants";

// Query content can be prefetched if it's likely to be used
export const usePrefetchContent = () => {
  // no-op
};

export const useCollections = () => {
  const results = useQueries([{
    queryKey: ["stac", STAC_URL], 
    queryFn: getCollections, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }, {
    queryKey: ["data", '/'], 
    queryFn: getDEPData, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }] );
  if (results[0].isSuccess && results[1].isSuccess) {
    return { isSuccess: results[0].isSuccess && results[1].isSuccess,
      data: {collections: [...results[0].data.collections, results[1].data]}}
  } else {
    return {
      isSuccess: false,
      data: {collections: []}
    }
  }

};

export const useStaticMetadata = staticFileName => {
  return useQuery([staticFileName], getStaticMetadata);
};

export const useTileJson = (query, renderOption, collection, item) => {
  return useQuery([query, renderOption, collection, item], getTileJson, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: Boolean(collection) && Boolean(query.hash),
  });
};

export const getTileJson = async ({ queryKey }) => {
  const [query, renderOption, collection, item] = queryKey;
  const tileJsonUrl = makeTileJsonUrl(query, renderOption, collection, item);

  const resp = await axios.get(tileJsonUrl);
  return resp.data;
};

let registerCancelToken = null;
export const createMosaicQueryHashkey = async (queryInfo, collectionId) => {
  // If there is a register request in-flight, cancel it. This is important because
  // this function is called as a result of an async thunk. If two register requests
  // are made very quickly, the first request may return after the second, causing the
  // map layer to refernce the wrong mosaic hash tiles
  registerCancelToken && registerCancelToken();

  // Make a new request
  const body = makeFilterBody([collectionFilter(collectionId)], queryInfo);
  const r = await axios.post(`${DATA_URL}/mosaic/register`, body, {
    cancelToken: new axios.CancelToken(c => (registerCancelToken = c)),
  });
  return r.data.searchid;
};

const getCollections = async ({ queryKey }) => {
  // eslint-disable-next-line
  const [_key, collectionsUrl] = queryKey;
  const resp = await axios.get(`${collectionsUrl}/collections`);
  return resp.data;
};

const getDEPData = async ({ queryKey }) => {
  // eslint-disable-next-line
  const [_key, collectionsUrl] = queryKey;
  const resp = await axios.get(`/data/dep-data.json`);
  return resp.data;
};

const getStaticMetadata = async ({ queryKey }) => {
  const [file] = queryKey;
  const resp = await axios.get(`static/metadata/${file}`);
  return resp.data;
};
