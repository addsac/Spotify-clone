import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
} from "@heroicons/react/outline";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplyIcon,
  RewindIcon,
  VolumeUpIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { debounce } from "lodash";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";

function Player() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(50);

  const songInfo = useSongInfo();

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        console.log("Now playing: ", data.body?.item);
        setCurrentTrackId(data.body?.item?.id);

        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body.is_playing) {
        setIsPlaying(false);
        spotifyApi.pause();
      } else {
        setIsPlaying(true);
        spotifyApi.play();
      }
    });
  };

  const debouncedAdjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch((err) => {});
    }, 300),
    []
  );

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      // Fetch the song info
      fetchCurrentSong();
    }
  }, [spotifyApi, session]);

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debouncedAdjustVolume(volume);
    }
  }, [volume]);

  return (
    <div className="h-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8 border-t border-gray-800">
      {/* Left */}
      <div className="flex items-center space-x-4">
        <img
          src={songInfo?.album.images?.[0]?.url}
          alt=""
          className="hidden md:inline h-16 w-16"
        />
        <div>
          <h3 class="text-sm">{songInfo?.name}</h3>
          <p className="text-xs text-gray-300">
            {songInfo?.artists?.[0]?.name}
          </p>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-evenly space-x-4 max-w-48">
        <SwitchHorizontalIcon className="button-player" />
        <RewindIcon
          // onClick={() => spotifyApi.skipToNext()} — Api is broken
          className="button-player"
        />

        {isPlaying ? (
          <PauseIcon
            onClick={handlePlayPause}
            className="button-player h-10 w-10"
          />
        ) : (
          <PlayIcon
            onClick={handlePlayPause}
            className="button-player h-10 w-10"
          />
        )}

        <FastForwardIcon
          // onClick={() => spotifyApi.skipToNext()} — Api is broken
          className="button-player"
        />
        <ReplyIcon className="button-player" />
      </div>

      {/* Right */}
      <div className="flex items-center justify-end space-x-3 md:space-x-4 pr-5">
        <VolumeDownIcon
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className="button-player"
        />
        <input
          type="range"
          value={volume}
          min={0}
          max={100}
          className="w-8 md:w-28"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <VolumeUpIcon
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className="button-player"
        />
      </div>
    </div>
  );
}

export default Player;
