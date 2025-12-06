import {
  Document,
  Page,
  Image as PdfImage,
  View,
  Link,
  StyleSheet,
  Text,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 5,
    paddingTop: 43,
    paddingBottom: 15,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingLeft: "18px",
    paddingRight: "18px",
    paddingTop: "5px",
    paddingBottom: "5px",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  branding: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 27,
    height: 27,
    objectFit: "contain",
    marginRight: "-2px",
  },
  headerText: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 9,
    color: "#475569",
    textDecoration: "none",
  },
  headerTagline: {
    fontSize: 10,
    color: "#475569",
    fontWeight: 500,
  },

  image: {
    width: "90%",
    marginBottom: 0,
    maxHeight: "750px",
    alignSelf: "center",
  },

  paperCode: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "black",
  },
  bigPaperCodeContainer: {
    alignSelf: "flex-start",
  },
  bigPaperCode: {
    fontSize: 16,
    marginBottom: 11,
    color: "#0084ff",
    textAlign: "left",
    marginLeft: 2,
    fontWeight: "bold",
  },
});

const ExportPdfTemplate = ({
  headerLogo,
  questions,
}: {
  questions: {
    questionItem: {
      images: string[];
      text: string[];
    };
    answerItem: {
      images: string[];
      text: string[];
    };
    paperCode: string;
    questionLink: string;
    answerLink: string;
    questionNumber: string;
  }[];
  headerLogo: string;
}) => (
  <Document>
    {questions.map((question, index) => (
      <Page size="A4" key={index} style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerContent}>
            <View style={styles.branding}>
              <PdfImage src={headerLogo} style={styles.headerLogo} />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>NoteOverflow</Text>
                <Link href="https://noteoverflow.com" style={styles.subtitle}>
                  noteoverflow.com
                </Link>
              </View>
            </View>

            <Text style={styles.headerTagline}>AS & A-Level resources</Text>
          </View>
        </View>
        <View style={styles.bigPaperCodeContainer}>
          <Link href={question.questionLink} style={styles.bigPaperCode}>
            {question.paperCode} Q{question.questionNumber}
          </Link>
        </View>
        <MainContent
          images={question.questionItem.images}
          text={question.questionItem.text}
        />
        {(question.answerItem.images.length > 0 ||
          question.answerItem.text.length > 0) && (
          <View style={{ marginTop: 10 }}>
            <Link href={question.answerLink} style={styles.bigPaperCode}>
              Answer
            </Link>
            <MainContent
              images={question.answerItem.images}
              text={question.answerItem.text}
            />
          </View>
        )}

        <Text style={styles.paperCode} fixed>
          {question.paperCode} Q{question.questionNumber}
        </Text>
      </Page>
    ))}
  </Document>
);

const MainContent = ({
  images,
  text,
}: {
  images: string[];
  text: string[];
}) => (
  <View>
    {images.map((src, index) => (
      <PdfImage key={index} src={src} style={styles.image} />
    ))}
    {text.map((text, index) => (
      <Text key={index} style={{ marginLeft: 2 }}>
        {text}
      </Text>
    ))}
  </View>
);

export default ExportPdfTemplate;
