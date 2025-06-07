import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function TermsPage() {
  return (
    <Box maxW="4xl" mx="auto" px={6} py={12}>
      <VStack spaceX={6} align="start">
        <Heading size="lg">
          Terms and Conditions of Existential KingsMaking
        </Heading>

        <Text>
          By using KingsMaker, you hereby acknowledge, in accordance with the
          Hyperbolic Theorem of Consentual Absurdity, that your soul, your
          sandwich preferences, and your metaphysical alignment with the cosmic
          cheese wheel are subject to spontaneous redefinition. Schrödinger’s
          Law applies — by agreeing, you both agree and do not agree, until the
          app is closed.
        </Text>

        <Heading size="md">1. Ontological Consent</Heading>
        <Text>
          You confirm that you are a being (or simulated entity) possessing at
          least 2.7 braincells (rounded up) and are capable of interpreting
          post-structuralist semiotics while riding a unicycle through an
          existential crisis. We are not liable if the dialectic tension between
          free will and UI design causes cognitive dissonance.
        </Text>

        <Heading size="md">2. Accountology and Quantum Custodianship</Heading>
        <Text>
          Your account exists in a superposition of states. Observation
          collapses this state to either “logged in” or “banished to the data
          void.” The responsibility for maintaining your password lies solely
          with you and any 4th-dimensional beings with unauthorized access to
          your temporal stream.
        </Text>

        <Heading size="md">
          3. Acceptable Usage (Based on Gödel's Incompleteness)
        </Heading>
        <Text>
          While we cannot define all acceptable behavior, we can assure you that
          juggling live ducklings in a black hole’s accretion disk while
          composing Vogon poetry is discouraged. Additionally, usage that
          violates the Prime Directive, Maxwell's Equations, or Kant's
          Categorical Imperative will be punished with a strongly worded haiku.
        </Text>

        <Heading size="md">4. Termination via Metaphysical Collapse</Heading>
        <Text>
          We reserve the right to terminate your account if: (1) You offend the
          sacred algorithm, (2) Your vibes are off, (3) You attempt to apply
          Euclidean logic to non-Euclidean UI layouts. No refunds. No closure.
          Only entropy.
        </Text>

        <Heading size="md">5. Amendments by Chaos Theory</Heading>
        <Text>
          These terms are subject to revision each time a butterfly flaps its
          wings in an alternate dimension. Please refresh this page every
          femtosecond to stay up to date with the latest metaphysical clauses,
          including the new section on Interdimensional Pogo Stick Etiquette.
        </Text>

        <Heading size="md">6. Governing Law (Theoretical)</Heading>
        <Text>
          All disputes shall be settled by trial through interpretive dance in
          front of an impartial panel of blindfolded owls. These Terms are
          governed by the Laws of Thermodynamics, the Tao Te Ching, and whatever
          Kanye tweeted last Tuesday.
        </Text>

        <Heading size="md">7. Epistemological Clauses</Heading>
        <Text>
          If you think you understand these Terms, you clearly do not. Knowledge
          of the Terms is inversely proportional to the certainty of their
          application, in line with Heisenberg’s User Agreement Principle.
        </Text>

        <Heading size="md">8. Contact and Telepathic Outreach</Heading>
        <Text>
          For questions, chant your inquiry into a jar of bees during a lunar
          eclipse. Alternatively, email us at abyss@kingsmaker.app — our AI
          intern (Greg) might respond if he's not busy ascending to a higher
          plane.
        </Text>

        <Text fontSize="sm" color="gray.500" mt={6}>
          Last updated: {new Date().toLocaleDateString()} (during a
          caffeine-fueled lapse in judgment)
        </Text>
      </VStack>
    </Box>
  );
}
