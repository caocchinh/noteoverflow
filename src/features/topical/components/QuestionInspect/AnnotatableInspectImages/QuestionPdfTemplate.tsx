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
  pageNumber: {
    position: "absolute",
    bottom: 12,
    right: 14,
    fontSize: 8,
    color: "black",
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
    paddingLeft: 2,
    fontWeight: "bold",
  },
});

const QuestionPdfTemplate = ({
  images,
  headerLogo,
  paperCode,
  questionLink,
  questionNumber,
}: {
  images: string[];
  headerLogo: string;
  paperCode: string;
  questionLink: string;
  questionNumber: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
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
        <Link href={questionLink} style={styles.bigPaperCode}>
          {paperCode} Q{questionNumber}
        </Link>
      </View>
      <View>
        {images.map((src, index) => (
          <PdfImage key={index} src={src} style={styles.image} />
        ))}
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
        fixed
      />
      <Text style={styles.paperCode} fixed>
        {paperCode}
      </Text>
    </Page>
  </Document>
);

export default QuestionPdfTemplate;
