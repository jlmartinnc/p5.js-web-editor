import styled from 'styled-components';
import { remSize, prop } from '../../theme';

export const AboutContent = styled.div`
  margin: ${remSize(42)} ${remSize(295)};

  @media (max-width: 1279px) {
    margin: ${remSize(20)};
    width: 95%;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;
  }
`;

export const IntroSection = styled.div`
  & h1 {
    font-size: ${remSize(32)};
    font-weight: 700;
  }

  & a {
    padding: ${remSize(12)};
    border: ${remSize(1)} solid ${prop('primaryTextColor')};
    border-radius: ${remSize(24)};
    display: flex;
    align-items: center;
    width: ${remSize(110)};
    justify-content: space-evenly;
    &:hover {
      color: ${prop('Button.primary.default.background')};
      background-color: ${prop('Button.primary.hover.background')};
      border-color: ${prop('Button.primary.hover.border')};
      text-decoration: none;

      & svg {
        & path {
          fill: ${prop('Button.primary.default.background')};
        }
      }
    }
  }
`;

export const IntroSectionContent = styled.div`
  display: flex;
  align-items: center;

  & div {
    height: 100%;
    align-items: center;
    font-weight: 550;
    font-size: ${remSize(24)};
    margin: ${remSize(24)};
  }

  & svg {
    & path {
      fill: ${prop('logoColor')};
    }
  }

  @media (max-width: 769px) {
    flex-direction: column;
    align-items: start;

    & div {
      margin: ${remSize(24)} 0;
    }
  }
`;

export const IntroSectionDescription = styled.div`
  line-height: ${remSize(27)};
  font-size: ${remSize(16)};
  margin: ${remSize(24)} 0;

  p {
    margin-bottom: ${remSize(24)};
  }
`;

export const Section = styled.div`
  margin: ${remSize(50)} 0;

  & h2 {
    font-size: ${remSize(24)};
    padding-bottom: ${remSize(30)};
    font-weight: 600;
  }

  @media (max-width: 769px) {
    display: grid;
  }
`;

export const SectionContainer = styled.div`
  display: flex;
  justify-content: row;
  padding-top: 0;
  font-size: ${remSize(16)};
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: 769px) {
    display: grid;
  }
`;

export const SectionItem = styled.div`
  width: 33%;
  display: flex;
  line-height: ${remSize(19.5)};
  font-size: ${remSize(14)};
  padding: 0 ${remSize(30)} ${remSize(30)} 0;

  & p {
    margin-top: ${remSize(7)};
  }

  & a {
    font-weight: 700;
    font-size: ${remSize(16)};
    &:hover {
      text-decoration: underline;
    }
  }

  & svg {
    padding-right: ${remSize(8)};
    width: ${remSize(30)};
    height: ${remSize(20)};
    & path {
      fill: ${prop('logoColor')};
      stroke: ${prop('logoColor')};
    }
  }

  @media (max-width: 1279px) {
    width: 50%;
  }

  @media (max-width: 769px) {
    width: 100%;
  }
`;

export const ContactSection = styled.div`
  margin-bottom: ${remSize(50)};

  & h2 {
    font-size: ${remSize(24)};
    font-weight: 600;
  }

  & div {
    display: flex;
    width: 100%;
    margin: ${remSize(20)} 0;
    font-size: ${remSize(16)};
  }
`;

export const ContactSectionTitle = styled.p`
  width: 50%;

  @media (max-width: 769px) {
    width: 30%;
  }
`;

export const ContactSectionDetails = styled.p`
  width: 50%;

  & a {
    color: ${prop('logoColor')};
    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 769px) {
    width: 70%;
  }
`;

export const Footer = styled.div`
  border-top: 0.1rem dashed;
  padding-right: ${remSize(20)};
  padding-bottom: ${remSize(70)};
  width: 100%;
  font-size: ${remSize(16)};

  & div {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  & a {
    padding-top: ${remSize(20)};
    padding-right: 9.5%;
    color: ${prop('logoColor')};
    &:hover {
      text-decoration: underline;
    }
  }

  & p {
    padding-top: ${remSize(20)};
    padding-right: 9.5%;
  }

  @media (max-width: 770px) {
    flex-direction: column;
    padding-left: ${remSize(20)};
    padding-right: ${remSize(20)};
  }

  @media (max-width: 550px) {
    padding-left: 0;

    & div {
      display: grid;
    }
  }
`;
