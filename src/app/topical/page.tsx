"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOPICAL_DATA } from "@/features/topical/constants/constants";
import { ValidCurriculum } from "@/constants/types";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import EnhancedMultiSelect from "@/features/topical/components/EnhancedMultiSelect";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BrushCleaning, ScanText, SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

const ButtonUltility = ({
  isResetConfirmationOpen,
  setIsResetConfirmationOpen,
  resetEverything,
}: {
  isResetConfirmationOpen: boolean;
  setIsResetConfirmationOpen: (value: boolean) => void;
  resetEverything: () => void;
}) => {
  return (
    <>
      <Button className="cursor-pointer w-full bg-logo-main text-white hover:bg-logo-main/90">
        Search
        <ScanText />
      </Button>
      <Dialog
        open={isResetConfirmationOpen}
        onOpenChange={setIsResetConfirmationOpen}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer w-full">
            Clear
            <BrushCleaning />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear all</DialogTitle>
            <DialogDescription>
              This will clear all the selected options and reset the form. Are
              you sure you want to clear?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer"
              onClick={() => {
                resetEverything();
                setIsResetConfirmationOpen(false);
              }}
            >
              Clear
              <BrushCleaning />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);
  const availableTopics = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.topic;
  }, [availableSubjects, selectedSubject]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const availableYears = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.year;
  }, [availableSubjects, selectedSubject]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const availablePaperTypes = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.paperType;
  }, [availableSubjects, selectedSubject]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const availableSeasons = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.season;
  }, [availableSubjects, selectedSubject]);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  // const [cachedData, setCachedData] = useReducer(
  //   (state: any, action: any) => {
  //     return { ...state, ...action };
  //   },
  //   {
  //     curriculum: "",
  //   }
  // );

  const resetEverything = () => {
    setSelectedCurriculum("");
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  };

  useEffect(() => {
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  }, [selectedCurriculum]);

  useEffect(() => {
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  }, [selectedSubject]);

  return (
    <div className="pt-16">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "23rem",
          } as React.CSSProperties
        }
      >
        <Sidebar variant="floating">
          <SidebarHeader className="p-0 m-0 sr-only ">Filters</SidebarHeader>
          <SidebarContent className="p-4 flex flex-col gap-4 mt-2 items-center justify-start ">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-6">
                <AnimatePresence mode="wait">
                  {selectedSubject && selectedCurriculum ? (
                    <motion.div
                      key={selectedSubject}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.15,
                        ease: "easeInOut",
                      }}
                    >
                      <Image
                        src={
                          availableSubjects!.find(
                            (item) => item.code === selectedSubject
                          )?.coverImage ?? ""
                        }
                        alt="cover"
                        className="self-center rounded-[1px]"
                        width={100}
                        height={100}
                      />
                    </motion.div>
                  ) : (
                    <div className="flex items-center flex-col justify-center">
                      <Image
                        src="/assets/pointing.png"
                        alt="default subject"
                        width={100}
                        height={100}
                        className="self-center"
                      />
                      <span className="text-sm text-logo-main">
                        Select {!selectedCurriculum ? "curriculum" : "subject"}
                      </span>
                    </div>
                  )}
                </AnimatePresence>
                <div className="flex items-start gap-6 flex-col justify-start">
                  <EnhancedSelect
                    label="Curriculum"
                    prerequisite=""
                    data={TOPICAL_DATA.map((item) => ({
                      code: item.curriculum,
                      coverImage: item.coverImage,
                    }))}
                    selectedValue={selectedCurriculum}
                    setSelectedValue={(value) => {
                      setSelectedCurriculum(value as ValidCurriculum);
                    }}
                  />
                  <EnhancedSelect
                    label="Subject"
                    prerequisite={!selectedCurriculum ? "Curriculum" : ""}
                    data={availableSubjects}
                    selectedValue={selectedSubject}
                    setSelectedValue={setSelectedSubject}
                  />
                </div>
              </div>
            </div>
            <div className="flex-col flex items-center justify-center gap-4">
              <EnhancedMultiSelect
                label="Topic"
                values={selectedTopic}
                onValuesChange={(values) =>
                  setSelectedTopic(values as string[])
                }
                loop={true}
                prerequisite="Subject"
                data={availableTopics}
              />
              <EnhancedMultiSelect
                label="Paper"
                values={selectedPaperType}
                onValuesChange={(values) =>
                  setSelectedPaperType(values as string[])
                }
                loop={true}
                prerequisite="Subject"
                data={availablePaperTypes?.map((item) => item.toString())}
              />
              <EnhancedMultiSelect
                label="Year"
                values={selectedYear}
                onValuesChange={(values) => setSelectedYear(values as string[])}
                loop={true}
                prerequisite="Subject"
                data={availableYears?.map((item) => item.toString())}
              />

              <EnhancedMultiSelect
                label="Season"
                values={selectedSeason}
                onValuesChange={(values) =>
                  setSelectedSeason(values as string[])
                }
                loop={true}
                prerequisite="Subject"
                data={availableSeasons}
              />
            </div>
            <div className="flex  w-[300px] justify-center items-center flex-col gap-4">
              <ButtonUltility
                isResetConfirmationOpen={isResetConfirmationOpen}
                setIsResetConfirmationOpen={setIsResetConfirmationOpen}
                resetEverything={resetEverything}
              />
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="mt-2 gap-6 flex items-center md:items-start justify-center flex-col ">
            <h1 className="text-2xl font-bold w-full pt-3 text-center ">
              Topical questions
            </h1>

            <h1>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed totam
              libero praesentium? Cum neque accusamus veritatis placeat nesciunt
              iste vel ab quam numquam! Unde, aut cupiditate! Quam voluptas at
              provident dolorem? Quo, soluta iure obcaecati officiis ipsam
              incidunt placeat fugiat laudantium. Corrupti ex culpa hic earum,
              dolores expedita explicabo reiciendis voluptas blanditiis
              cupiditate omnis repudiandae modi magnam possimus excepturi alias
              reprehenderit minus, optio iure animi ratione adipisci minima non.
              Reiciendis et fugiat magnam enim, repellat iste quam illo quod
              non? Repudiandae beatae a facere porro. Obcaecati debitis
              doloremque similique amet laborum eius aut repudiandae non quos
              aliquid atque nam eaque quaerat architecto, recusandae inventore
              est? Atque neque veniam officiis. Repellendus nisi ipsa commodi
              quidem eius aliquam facilis! Error nesciunt dolore nulla
              perferendis. Commodi accusantium nostrum cum nobis placeat ad,
              error consequuntur aperiam exercitationem beatae atque? Officia
              culpa, nam quaerat ipsam qui architecto, minus non, aut aperiam
              aliquam cum fuga quo eum modi reiciendis sit quasi similique.
              Facere numquam architecto obcaecati, quos accusamus recusandae
              similique, magni aperiam aliquam labore libero maxime excepturi
              doloremque! Repudiandae reprehenderit expedita consectetur error
              cumque magni distinctio amet doloribus ex minus molestiae, itaque
              dolores assumenda quos suscipit exercitationem deserunt. Tenetur
              repudiandae magnam nihil inventore. Esse perspiciatis ut dolorem
              quo quae mollitia, eius aspernatur corporis ipsam inventore quod?
              Beatae animi sit, dolore optio tenetur alias? Quo dolorum magnam
              vel eum labore sit, provident repellat minus dolores in quibusdam
              ullam aut quos libero temporibus voluptatem neque quia corrupti
              nobis rerum autem, velit delectus eveniet commodi. Sed nulla optio
              beatae similique temporibus, sequi maxime repudiandae assumenda
              amet culpa repellat quisquam doloribus atque qui totam labore nemo
              nobis, architecto possimus at perspiciatis voluptas? Laborum
              laboriosam cum, ratione, autem totam maiores quia eum labore
              obcaecati porro recusandae hic nisi quos ipsa. Deleniti fugiat
              itaque aperiam? Labore, debitis voluptates praesentium obcaecati
              facere quaerat nesciunt beatae officia nam sapiente explicabo
              doloribus dolor dolore natus vero dolores eos sequi ea
              perspiciatis perferendis modi non aperiam, possimus numquam.
              Tempore fuga rem assumenda, maiores deserunt, veniam nulla et
              accusamus ratione natus eligendi eos maxime iure numquam neque
              praesentium, soluta molestiae ut. Beatae ea amet veniam delectus
              ipsum vitae voluptas hic, vel possimus animi nostrum commodi, odit
              aspernatur voluptatibus saepe rem sapiente! Tempore est sit optio
              vel unde, neque amet. Quasi quaerat dignissimos molestiae.
              Temporibus beatae omnis commodi ipsam animi modi non est minus
              laborum numquam eligendi quis sapiente tenetur nulla itaque
              facilis at perspiciatis, minima placeat? Quibusdam earum alias
              maiores non sapiente molestias magni, est, velit, praesentium
              laborum aliquam. Iusto optio sapiente tenetur. Facere doloribus
              repellat, eaque vel illum incidunt, alias magni consectetur nulla,
              aliquid rem qui accusantium repudiandae! Quia delectus distinctio
              ex ea mollitia, ipsum praesentium laboriosam dolores placeat, a
              incidunt? Est, veritatis nam eveniet cumque impedit doloremque
              accusamus velit ipsa rerum eos nemo aspernatur asperiores cum fuga
              dolorem, laborum illo earum dolor porro, facere fugiat harum
              ducimus temporibus repudiandae? Dolores corporis id ut ab quisquam
              sapiente harum distinctio architecto beatae accusantium natus
              dolore eum reprehenderit, nobis aliquam iure aut nesciunt ad,
              assumenda nulla tempore sit facere? Autem pariatur temporibus sunt
              minus! Deserunt, ducimus fugit ex facere quaerat quos, quam
              consectetur inventore voluptatum beatae voluptas assumenda
              veritatis pariatur, quis consequatur consequuntur. Maxime nostrum
              dolor minus esse assumenda quidem officia hic! Dolorem dolores
              magni blanditiis, minima illum commodi. Rerum, consequuntur eius.
              Neque praesentium veniam porro commodi dolor accusamus ipsam,
              adipisci, perspiciatis quasi, consequuntur consequatur. Suscipit
              delectus sapiente laudantium unde ab blanditiis asperiores eius
              debitis minima minus eos iure architecto cum autem, doloremque in
              nisi sint alias quia nesciunt quaerat fuga impedit mollitia!
              Officiis ipsa commodi culpa ipsum suscipit, corrupti voluptate
              eius ea magnam animi voluptatem minus, vero ratione sint sit iure.
              Ab, commodi nam facilis itaque, alias unde numquam, eaque sunt
              velit nesciunt modi tempora temporibus distinctio. Officia, nobis
              in beatae ad sint expedita, temporibus aperiam exercitationem
              ipsam porro reiciendis. Nostrum dolore iusto dolorum officia sit,
              possimus pariatur. Expedita in eligendi excepturi dolorum nam ex
              deserunt inventore unde dicta natus, ut laboriosam eveniet,
              reprehenderit obcaecati vitae voluptas fugit fugiat labore
              officiis omnis quam exercitationem alias enim! Iure dolores eius a
              unde quisquam inventore rem eveniet et provident! Nisi inventore
              natus mollitia architecto, delectus omnis corporis, totam
              laudantium cupiditate sit officia quasi quos. Impedit sint ipsam
              deserunt debitis quidem. Rerum dicta voluptatum dolor molestias et
              incidunt non atque perspiciatis veritatis quam facilis tempora
              enim, error ratione sed cumque perferendis eum rem necessitatibus
              ab est consequatur. Rem aliquid similique, blanditiis quas totam
              error, nisi quis amet quos corporis dolores maxime tempora nobis
              obcaecati eum, dicta dolor reiciendis nostrum inventore. Assumenda
              perspiciatis ex tenetur cumque eveniet sequi pariatur libero fugit
              alias quia deserunt odit dolorem nam et aliquid repudiandae est,
              minima, aut fugiat doloribus porro, voluptate natus. Sequi cum
              alias aperiam modi quidem! Culpa nisi, id eligendi eius sint cum.
              Corporis nam, sint alias voluptas quae consequuntur. Dolorum ullam
              amet, cumque cum in dolor minima laborum, corporis ab, odio eos?
              Doloribus vitae suscipit placeat, aperiam officiis, necessitatibus
              maxime eveniet deserunt quaerat debitis ex sunt non magni sed
              dicta voluptatem quam a optio saepe itaque! Omnis, adipisci
              officiis molestiae exercitationem ipsum ab consequuntur eaque
              commodi vitae deserunt, quibusdam ut architecto. Optio nesciunt
              dolore aliquam cum consequatur sequi. Quisquam, modi libero totam
              veniam voluptate omnis perspiciatis ea voluptatem dolores ducimus
              repellat doloribus vel amet molestiae magnam quia ut dolorem
              provident laboriosam? Velit laudantium quidem corrupti rerum enim
              debitis ex ab autem aspernatur! Quod deleniti reprehenderit
              voluptates, explicabo odit nesciunt quas delectus. Magni rem, vero
              modi obcaecati fugiat facilis, esse neque sunt asperiores,
              incidunt voluptates natus? Incidunt, aut iure. Cum deleniti atque
              pariatur provident, possimus fuga exercitationem, repellat amet
              nostrum tempore maiores, dolore ea magnam sunt fugit excepturi ut
              tenetur. Blanditiis ex temporibus doloribus, eos, tenetur
              voluptatibus fugiat eum praesentium nemo deserunt ipsa itaque
              perferendis. Unde quod impedit explicabo, veritatis recusandae
              eius dolorum veniam, assumenda quidem voluptate numquam cum?
              Provident consectetur ullam reprehenderit nam assumenda, inventore
              magni! Vel perferendis praesentium, mollitia libero provident
              autem eveniet molestias in voluptate sequi porro quae dolor
              corrupti voluptas deleniti! Nihil reiciendis laborum voluptatem
              dolorum. Illum culpa, accusantium cum saepe consequatur provident
              illo a nulla esse alias expedita eaque eligendi corporis
              exercitationem iure molestias et. Similique necessitatibus nemo
              tempora delectus nostrum assumenda ipsa sunt amet sint eos quas
              culpa, cupiditate at aliquid molestiae rem modi? Dolores iure
              veniam esse blanditiis. Amet sequi, quos nulla sit magnam eos modi
              molestiae aperiam, deserunt soluta perspiciatis, rem eveniet ea
              ipsum eius accusamus iusto quaerat delectus totam sunt officia!
              Repellat ipsa itaque esse delectus natus, ullam incidunt unde
              laborum ad nemo commodi fuga odit fugit dicta vero non quis dolor
              qui ea reiciendis quisquam. Perspiciatis voluptatum odio quisquam
              dolorum rerum, non omnis dicta molestias expedita est accusantium
              quae autem culpa sapiente totam voluptatibus blanditiis aperiam
              optio! Consectetur eius unde fugiat, optio veritatis, ab vitae
              ullam libero assumenda maxime, dignissimos cumque corporis
              nesciunt illo natus consequatur adipisci corrupti ipsum vel quis
              aut dicta eaque repellat. Ad adipisci doloribus quas neque ipsa
              natus fugiat ducimus, tempore harum quia, labore numquam ex earum
              debitis commodi recusandae modi eligendi obcaecati, illo aut
              mollitia quos. Consectetur voluptatem maxime nostrum ullam
              recusandae necessitatibus fugiat exercitationem voluptates rem quo
              architecto, itaque dolor quibusdam veritatis soluta cumque non
              optio ducimus unde hic eaque quam. Dignissimos repudiandae, illo
              veniam beatae officiis nulla aliquid. Laborum, quaerat. Deserunt
              provident cum accusamus esse architecto mollitia, neque ex
              necessitatibus voluptate quo! Adipisci provident quas optio soluta
              amet minus numquam, eaque aliquam accusamus inventore, reiciendis
              aspernatur sed est porro at quo doloremque! Nihil soluta
              praesentium doloremque recusandae quibusdam accusamus accusantium
              aliquid repellat doloribus aut, laboriosam corporis ullam possimus
              illum error minus exercitationem quas minima atque fugit dolorum
              ratione! Laborum, iure impedit. Sequi aspernatur sunt, dolorem non
              quas corporis eius deleniti totam tempora? Vitae provident
              architecto deleniti, harum ipsum tempore. Earum veritatis tempora
              aliquam dicta, mollitia quasi distinctio vitae sint, nobis commodi
              perspiciatis incidunt doloremque, sed itaque quam. Voluptatibus
              rem consectetur incidunt natus hic sint quisquam, tenetur nulla
              quia doloremque sed expedita voluptates totam quos recusandae
              perferendis nihil tempore a. Suscipit, nobis iusto minus
              accusantium doloribus fugit nulla quidem consequuntur id laborum
              possimus. Eum temporibus nisi autem officia mollitia, nobis illum
              pariatur asperiores laborum nulla incidunt libero molestiae
              inventore alias quisquam! Minima hic consequuntur sapiente
              recusandae tempore dolorem fugit aut sit ullam qui, quisquam
              perspiciatis alias! Quidem, adipisci autem sunt nobis veniam error
              doloribus iusto est ut optio temporibus earum, modi rem, itaque
              quaerat quisquam enim tempore corporis nam neque repudiandae illum
              illo. Asperiores consequuntur aut officia sequi voluptas similique
              distinctio reiciendis veritatis a culpa obcaecati quas atque dicta
              sint, consequatur quam adipisci accusamus deserunt ullam. Aliquam
              possimus natus minima nostrum et recusandae illum. Officia
              asperiores dolor hic maiores fugiat amet voluptatibus ipsum
              quibusdam explicabo soluta. Nostrum, delectus illum! Adipisci
              facere reiciendis quam accusantium dolorem culpa ab necessitatibus
              molestiae totam, perferendis tenetur quos eius deserunt nobis ut
              soluta voluptas nulla autem nihil. Eos sed, dolor magnam
              necessitatibus quos quas fugit expedita optio eaque, nam ipsa
              quod, culpa perferendis vitae velit minima. Veritatis, itaque
              aperiam. Molestias expedita facere amet maiores cupiditate dolorem
              architecto voluptatum harum cumque voluptas ipsum non enim sint
              magnam, error minima. Quo quas mollitia, iusto ratione totam
              quaerat pariatur soluta maxime eius corrupti ab fugit est
              perspiciatis doloribus quia veniam incidunt distinctio aliquid?
              Cum officiis a illo harum sed et doloremque voluptates mollitia
              cupiditate animi maxime dignissimos, quas repellat dolore
              reprehenderit ducimus? Voluptate repellendus eos reprehenderit
              ducimus debitis velit et molestiae fugiat aut cum similique
              laudantium ut, voluptatum nihil labore amet voluptatibus,
              molestias rem ratione dolores? Similique velit dolorum suscipit
              iure! A minima sit, quibusdam vitae molestias rem aspernatur?
              Aperiam dolores eveniet quam nulla assumenda obcaecati dolor
              cumque. Nemo, illo excepturi vel beatae voluptas sit blanditiis
              accusamus. Sed doloremque, quod laboriosam voluptas a iusto
              expedita aspernatur facilis accusamus et eaque quidem ullam
              laborum id porro, totam nostrum incidunt tenetur asperiores,
              beatae molestiae tempora eius quibusdam! Consectetur quibusdam
              illum temporibus? Dolore incidunt omnis nobis modi! Possimus illo
              omnis soluta dolorem, id laboriosam porro quo commodi aperiam eum
              labore, enim consequatur sequi adipisci quos perspiciatis eveniet
              illum? Reprehenderit, assumenda dolor. Eos beatae, est
              reprehenderit, totam a nisi laboriosam similique corporis, neque
              vero recusandae inventore quas debitis quaerat quasi! Modi velit
              quam minus suscipit. Atque praesentium dignissimos similique
              nesciunt temporibus blanditiis deleniti explicabo fugiat, eum
              impedit voluptate ipsam architecto magni corrupti, incidunt
              officiis voluptatum, rem vel commodi quasi. Qui id enim quis rerum
              minima itaque saepe cumque eligendi! Illo, placeat sed animi
              deserunt provident, alias laborum repellat tempora labore,
              perspiciatis iure ullam? Corrupti harum culpa esse ipsam
              blanditiis iure exercitationem sapiente? Cumque voluptas explicabo
              quasi qui quibusdam sequi saepe, quos at eum quidem natus officia!
              At aliquid itaque ea et soluta illum labore vel omnis voluptas
              fugit aut earum sapiente reiciendis neque exercitationem, aliquam
              quia laboriosam quidem non, numquam quisquam odit nemo. Quod earum
              consequuntur magni eligendi quam libero impedit corrupti nobis
              assumenda provident quae, rerum dicta quo facilis animi quis porro
              placeat necessitatibus enim, atque ab debitis tenetur. Aperiam ad
              labore tenetur, maxime ducimus ipsum voluptatem magni soluta
              voluptatibus aliquid, illo fuga adipisci, repudiandae dolore
              delectus optio explicabo distinctio similique quibusdam
              dignissimos dolor dolorem unde. Eaque, quas! Commodi amet totam
              nulla eos, adipisci quo minus autem consectetur quisquam ducimus
              velit id a dolorem nam at magnam hic dolorum qui fugiat! Et
              exercitationem sed amet quo architecto dicta error eveniet dolor,
              saepe, officiis eius perspiciatis dolorum tempora in perferendis
              molestias quis aliquid laboriosam harum? Ipsa nostrum soluta
              magnam voluptatibus! Enim cum beatae minus quibusdam, consequuntur
              illum, earum, excepturi sit unde eum consequatur qui! Similique a
              nostrum optio quaerat ut sapiente quod corrupti eius asperiores
              quos voluptas praesentium neque eum ea quas quibusdam sit quasi,
              eos, impedit corporis cumque minus. Voluptates facere ullam
              necessitatibus enim blanditiis corrupti doloribus obcaecati atque,
              sequi, illo laboriosam autem natus magni ad hic quod, pariatur
              neque vitae veniam placeat. Vero dolore eius necessitatibus quasi
              quo. Incidunt corporis aperiam sed, rerum enim, blanditiis alias
              placeat laborum mollitia officia exercitationem illum optio
              numquam sint. Non possimus voluptate doloribus quaerat provident
              temporibus accusantium facere libero incidunt illum earum laborum
              ut et quia minima, perspiciatis quam vel rem consequuntur cumque
              quisquam architecto odio? Esse eligendi assumenda consectetur
              similique nulla adipisci ratione rerum doloremque praesentium nemo
              facilis, voluptatibus nihil quo minus provident quos commodi et
              voluptates repudiandae obcaecati mollitia odio sit. Asperiores
              nostrum totam ad illo, officiis ullam repellendus possimus
              voluptates neque iste enim non expedita vel temporibus tenetur
              alias saepe consectetur dolor magni facere sapiente. Magni debitis
              harum voluptates. Ipsum, illo! Totam similique necessitatibus
              dolor natus iure voluptate ipsam temporibus, odio nobis saepe
              voluptatibus cupiditate sint porro voluptatum rerum consequatur
              nam recusandae delectus accusantium fugiat est ea nisi! Eum
              voluptate, ea aliquam officia libero, veniam a nesciunt vitae odio
              delectus tempora aliquid repudiandae illo suscipit neque cumque
              cum. Harum rerum, nostrum incidunt facere accusamus fuga nobis
              labore quibusdam quam praesentium sunt, atque nisi error assumenda
              repellat consectetur ea necessitatibus velit tempora temporibus!
              Alias sapiente fugiat, dignissimos voluptatum, quam iste quod
              optio explicabo quis facere asperiores excepturi suscipit odit
              reprehenderit voluptatibus repellat dolores, corrupti reiciendis
              qui nam. Beatae rerum incidunt suscipit. Ut odio aut dignissimos
              iste. Excepturi laudantium quasi molestias at labore praesentium
              eaque inventore asperiores placeat optio? Accusamus, ad a quidem
              deserunt perspiciatis consequatur totam mollitia. Doloribus,
              maiores eius quis magnam necessitatibus debitis aliquam! Odit
              debitis tenetur ducimus reprehenderit labore, culpa neque
              recusandae magnam. Explicabo, architecto quidem perspiciatis et
              ipsa accusamus minus doloribus dicta voluptatem veritatis
              molestiae illo minima vero hic, voluptate at nesciunt. Minus
              corrupti tempora aperiam molestiae pariatur magnam tempore quidem!
              Corporis modi, minima rerum provident placeat ad illo, tenetur
              nesciunt magni deleniti ducimus. Vel necessitatibus soluta nihil
              sunt alias, aperiam, culpa deleniti praesentium eligendi
              consectetur explicabo laudantium, cum aspernatur temporibus
              tempora nostrum aliquam nam! Vero quod expedita alias molestias
              tempore explicabo iusto eligendi commodi error corporis! Accusamus
              consectetur explicabo id eos nulla, aut consequuntur alias
              corrupti inventore quidem sit architecto, veniam exercitationem
              voluptate obcaecati molestiae pariatur in quibusdam natus laborum
              nostrum. Sequi, expedita dolorum corporis magni, architecto ad
              consectetur facilis aliquid omnis atque, porro nam cumque
              assumenda consequatur enim officia hic explicabo ratione.
              Voluptatem, a. Unde quasi expedita ab eveniet accusamus
              perferendis dignissimos nihil reiciendis odit numquam, provident
              harum debitis illo veniam ullam at! Ullam illo neque explicabo
              tempora nihil veniam iure. Quam nesciunt molestiae quibusdam
              delectus sunt iusto quae laudantium quod necessitatibus
              voluptatem, a minima architecto nulla assumenda eius porro nemo
              mollitia! Error optio, quae praesentium obcaecati itaque illo
              tempora iusto corrupti possimus quis? Laborum iure asperiores ut,
              magnam blanditiis quaerat voluptatum esse numquam ullam.
              Accusantium dolor laboriosam iusto odit quo, voluptates excepturi
              quia ad explicabo, consequuntur odio vel nostrum sint ut illum?
              Unde enim est itaque odit accusamus exercitationem, consectetur,
              maiores expedita quasi facilis aperiam commodi, nesciunt quo
              consequuntur ad. Praesentium blanditiis beatae magnam, facere
              reprehenderit aliquid vero delectus pariatur modi dolores suscipit
              harum dolorem cumque odio quibusdam ullam quis a laborum nesciunt
              aspernatur adipisci ipsam. Minima aliquid cupiditate hic
              perspiciatis pariatur non ut dolorum eos? Alias aperiam nobis
              similique sit neque deserunt repellat cum exercitationem, aliquam
              quisquam omnis quo, itaque vitae commodi accusantium reprehenderit
              soluta odio, maxime rerum numquam. Debitis beatae ducimus officiis
              corporis reiciendis, voluptatum pariatur assumenda mollitia
              reprehenderit ipsam eum voluptatem molestiae dolorem suscipit
              atque iste dolorum quo excepturi itaque aliquam repudiandae
              tempora officia autem! Et magnam necessitatibus soluta quos qui
              nisi, repellat iure ab. Amet eius nostrum quis, ut non
              perspiciatis! Placeat maxime voluptate adipisci sunt, vitae
              corporis optio amet perspiciatis aut eaque perferendis iure, animi
              nulla enim. Aut est vitae, mollitia fugit facilis consectetur
              consequatur officiis vero, pariatur odio eum suscipit
              exercitationem assumenda eos enim amet? Consectetur debitis
              perspiciatis porro delectus, voluptas harum id quibusdam nostrum
              ullam maiores autem quos doloribus temporibus repudiandae nemo
              blanditiis error officia quidem assumenda praesentium nisi aliquid
              soluta! Dolore ut aperiam, velit iure quod doloribus? Rerum
              possimus quasi ea! Ipsum cumque quae earum dolor adipisci vero
              eaque quas aut, consequuntur libero rem, impedit optio
              exercitationem dolorem blanditiis accusamus repudiandae harum vel,
              asperiores minus numquam debitis? Officia corporis eligendi
              facilis quisquam vitae culpa illum, molestias alias. Dolor magni
              sapiente tenetur ipsum numquam voluptatem sed fuga nemo voluptatum
              iste deserunt molestiae error ratione voluptate, a accusantium,
              repellat magnam optio mollitia rem adipisci nesciunt ad maxime.
              Ipsam modi, saepe quisquam doloremque quas consectetur voluptatum
              iste molestias culpa, velit sunt dolorum repellendus fugiat
              veritatis ducimus error eum tempore! Provident pariatur hic
              impedit porro ex repellat fuga reprehenderit magnam. Voluptate
              veniam laborum, quia nihil omnis veritatis tenetur architecto.
              Quos, soluta cum. Ratione culpa odit itaque quidem molestiae
              dignissimos ut. Inventore reiciendis, possimus saepe, ipsa
              exercitationem eius sit sapiente excepturi provident natus ut, at
              ex asperiores numquam facere soluta nam sunt voluptatibus dicta
              vero laudantium ducimus dolores mollitia veritatis! Provident quia
              cupiditate praesentium quos et reiciendis maiores a cum eius vero
              nesciunt iste architecto repellat laboriosam voluptatem, libero
              sapiente iusto sint nisi facere nemo necessitatibus magni numquam.
              Corporis laboriosam vitae asperiores? Nesciunt, accusantium
              numquam sequi excepturi repellendus illo debitis aperiam illum
              consequatur tenetur maiores vel ab, mollitia nam saepe officia
              voluptatem est sapiente nobis. Reiciendis asperiores temporibus
              molestiae repellat quasi suscipit vel, accusamus perspiciatis non
              laboriosam veritatis et libero consequatur esse qui quidem amet ea
              impedit ad! Impedit minima esse labore nostrum veniam totam
              accusamus recusandae explicabo animi nisi ullam fugiat praesentium
              quasi eligendi dolor error similique inventore dolore dolorem,
              voluptatibus odit. Minus earum, necessitatibus quidem voluptas,
              libero at quo beatae nemo similique delectus sunt. Amet, nam,
              aliquid, eligendi architecto aut dolorum enim reiciendis unde cum
              excepturi ex repellendus repudiandae sed voluptas consequuntur
              ducimus! Vitae cupiditate, tempora molestiae aperiam temporibus
              doloribus dicta sint sunt distinctio. Culpa ipsa porro dignissimos
              mollitia voluptate asperiores ea! Aut, rem recusandae ad eius
              explicabo illum voluptatibus impedit veritatis ipsum nisi corrupti
              ut voluptatem optio molestias unde minus soluta pariatur
              consequuntur incidunt accusantium hic commodi? Ex earum fugit
              mollitia facere tempora sunt omnis voluptatem adipisci ipsum,
              itaque esse beatae voluptate incidunt qui tempore odit voluptas in
              repellendus quae illo! Similique tenetur, maxime voluptatum
              accusantium rerum perspiciatis! Veniam obcaecati voluptatem
              repudiandae? Modi, assumenda. Excepturi eaque quia atque sequi.
              Odit autem, facilis eaque voluptatibus, distinctio eveniet rerum
              quas asperiores quisquam cupiditate nesciunt perferendis! Nihil, a
              ad. Dolores odio recusandae est, illo iure quidem autem molestiae
              cupiditate minus quas ipsum consectetur sapiente reiciendis
              numquam, laborum tempore adipisci similique nobis omnis placeat
              quae perferendis. Perferendis debitis dolorum nemo reiciendis,
              atque exercitationem sequi earum quo pariatur eius ea sunt vero
              repudiandae temporibus quis, sed odio tempore rem est dolores
              ullam nulla, eum magnam aut! Quod quasi dolor pariatur accusamus
              nihil porro labore in, iusto ex quo reprehenderit cum quos placeat
              possimus excepturi consectetur eius. Recusandae quibusdam nobis
              fuga ratione magnam! Explicabo dolor culpa laborum consectetur
              nulla. Ipsa nisi nihil saepe odit reiciendis nesciunt, explicabo
              voluptate consequuntur atque omnis illo veritatis eveniet dolorem
              id sapiente, inventore corrupti, laboriosam ipsam quaerat! Neque
              nihil dignissimos modi temporibus accusamus ad, sunt repellendus
              necessitatibus ducimus deleniti iusto adipisci fuga repudiandae,
              nesciunt blanditiis quo? Iure, tempora laboriosam sit fugiat
              labore quisquam odio nostrum in nisi aperiam odit sequi commodi.
              Reprehenderit suscipit magnam a maiores illum rerum rem, culpa
              quis odio vel itaque eligendi, reiciendis dignissimos voluptates
              eos, eum necessitatibus iure amet quidem eaque quo quod nihil
              tempora? Adipisci maiores laboriosam placeat animi repudiandae,
              sapiente maxime soluta quis accusantium officia possimus numquam
              expedita quam, explicabo odit culpa aut architecto earum non
              nesciunt ratione, unde saepe assumenda veritatis! Delectus fugiat
              impedit rerum quis perspiciatis autem quia ullam esse nisi itaque
              modi minus sit voluptatem et totam libero quisquam vitae, adipisci
              excepturi accusantium repellendus commodi? Et ipsa esse doloremque
              deserunt possimus laudantium ipsam nisi autem, quia distinctio
              exercitationem hic atque, excepturi voluptates velit omnis.
              Sapiente voluptate, molestias repellat quod tempora sed natus vero
              blanditiis quas non ipsum perferendis est? Ex, laboriosam amet?
              Quasi veniam sapiente autem distinctio. Deserunt ad praesentium
              debitis atque optio qui eveniet fugit perferendis et numquam fuga
              corrupti consequuntur quo adipisci dolor vel delectus quisquam
              excepturi, veniam omnis esse sit quaerat totam error! Nostrum
              distinctio culpa eligendi iure neque asperiores mollitia
              architecto velit molestiae soluta dolore inventore est officia
              non, facilis doloribus laudantium minima officiis praesentium
              atque? Omnis id molestiae ullam laudantium soluta expedita sint,
              iste totam possimus sit odio recusandae ipsum beatae et iusto
              dolores delectus nam dicta voluptatem consequatur cum voluptates
              error. Temporibus porro a impedit rem quo odio, laboriosam
              accusamus dolore explicabo numquam nostrum blanditiis nihil
              tempore. Tempora unde temporibus libero dolores ipsa quod illum
              veniam et, nihil consequatur. Quos distinctio autem accusamus
              exercitationem praesentium iure molestiae, provident fugiat
              asperiores magnam id nam nulla consequatur eum alias neque quas
              esse, minima facilis ut? Numquam, quibusdam. Ut neque, repellendus
              tenetur quia atque nisi quos deleniti unde, maxime provident,
              accusantium dolor illum consequatur culpa? Officiis fugit, dolorum
              enim harum autem vitae eos impedit nisi reiciendis voluptates
              optio beatae cum, dolor architecto maxime blanditiis, nostrum quo
              vel dolorem hic eveniet. Voluptatum, nostrum architecto! Excepturi
              in eum ex officia aliquam doloribus esse, minus, ipsam perferendis
              mollitia dolorum sequi cupiditate non praesentium libero explicabo
              natus, saepe fugiat provident cumque deleniti fugit? Laudantium
              doloremque a, praesentium totam repudiandae quasi eligendi at
              temporibus eius, beatae dicta atque animi, sapiente voluptatem
              expedita. Ipsa quidem error beatae ad, magnam vitae, saepe dicta
              laborum molestias blanditiis ratione eveniet ab nulla. Dolorum
              accusamus quibusdam ex nostrum enim sapiente atque quos autem. Sed
              culpa quidem quis. Blanditiis totam maxime id distinctio deserunt
              modi quo accusamus non doloremque quod! Dolore mollitia quae
              commodi facilis rerum quas quasi nesciunt voluptatibus asperiores,
              consectetur minima saepe maxime vitae accusamus? Illum
              exercitationem illo numquam ab voluptatem excepturi animi alias
              sed iusto consequatur! Incidunt atque ad odit provident maiores
              nam officia accusantium suscipit quo repudiandae! Doloribus, quae.
              Asperiores nisi impedit quis reiciendis culpa omnis quae similique
              doloribus, sapiente ea? Illum doloribus asperiores nihil ex
              architecto dolorum velit quis inventore ea, aut sint sequi
              mollitia, voluptatem consectetur eaque, cupiditate nemo! Ad
              quaerat nulla, veniam modi consequatur minima repellendus
              voluptate, quae ducimus facilis suscipit mollitia consequuntur
              rem! Atque velit, ad labore voluptates et aspernatur quidem
              voluptatum iste quia nihil, reiciendis assumenda sunt! Assumenda
              necessitatibus a ipsum tempore enim voluptas porro repellendus
              totam officia deserunt repellat accusantium quaerat et, explicabo
              aliquid. Fuga architecto maiores minus quia sed in qui, explicabo
              officia corrupti, ut reiciendis eveniet molestiae vitae
              consectetur laudantium deleniti, reprehenderit nesciunt sequi
              molestias sunt. Ab exercitationem aliquam praesentium sit
              doloremque nihil, cupiditate, ad velit, pariatur vero impedit
              distinctio ipsam? Dolores sint autem officiis deserunt harum
              quidem at atque deleniti nesciunt ex! Natus eum quas amet
              necessitatibus sequi deleniti veritatis pariatur error rem
              voluptates corporis repudiandae sunt, ab, nulla saepe similique
              iste fugiat dolor? Placeat ipsa quisquam repudiandae hic quaerat
              assumenda voluptates quod maiores expedita consequuntur voluptas
              veniam nostrum, distinctio iure accusantium nesciunt beatae
              deserunt, exercitationem quae totam dignissimos, optio reiciendis
              eum? Ad commodi odio quos voluptatibus nemo labore eum tempore
              optio nesciunt id consectetur aliquam vero suscipit accusamus
              aspernatur sint vel perspiciatis odit aperiam modi, ratione iste
              corporis itaque nulla? Quis eos ex quo explicabo molestias
              voluptas dolorem sapiente ullam, ipsam molestiae. Quidem ipsum
              vitae cum maxime exercitationem quod, sunt ad, quaerat qui itaque
              quos, in nihil voluptatibus quas repellendus doloremque expedita
              officia suscipit consequuntur officiis. Accusamus facilis
              voluptate molestias modi nesciunt temporibus, quaerat minima
              ratione quis pariatur quibusdam dolorum. Nesciunt perferendis sit,
              voluptatum asperiores est porro earum dolore obcaecati odit maxime
              ipsum repudiandae natus aperiam, officia velit ea qui quos
              dolorum? Neque dicta ullam doloremque vero perspiciatis numquam
              recusandae, delectus ipsa odio dolor rem animi quisquam ut aperiam
              incidunt ex obcaecati aspernatur dolores fugiat earum dolorem sint
              repudiandae tempore. Blanditiis, rem corporis omnis earum amet
              vitae aliquam! Reiciendis animi molestias deserunt numquam
              voluptas eaque fugiat consequuntur dolorem deleniti consequatur
              eos cupiditate, eligendi accusamus impedit alias architecto soluta
              fugit, delectus dolores, similique earum hic! Harum nemo inventore
              maiores magnam modi ducimus sapiente tempore dolorem ipsum,
              corrupti quod praesentium optio atque fugiat aliquam dolorum minus
              beatae et cupiditate animi ipsam unde expedita illo incidunt!
              Debitis repudiandae consequatur pariatur aut! Vel provident
              aperiam, suscipit modi, odit sapiente quia recusandae dolorum
              excepturi, explicabo ea eaque cupiditate corrupti atque itaque
              nisi error molestias. Iste in, exercitationem sed fugit accusamus
              sapiente architecto sunt enim. Ea voluptatibus reiciendis quod
              odit odio. Ut amet facere commodi. Facilis reiciendis
              reprehenderit modi iure unde odit possimus suscipit tenetur, ea
              incidunt consectetur maxime error cum, sit expedita quia maiores
              dignissimos sint distinctio. Totam temporibus adipisci ipsum
              placeat, reprehenderit aspernatur laudantium molestias quibusdam
              esse odit culpa et, nulla molestiae quos iusto provident ea
              quaerat delectus necessitatibus amet quod recusandae praesentium
              dignissimos eligendi? Blanditiis natus tempora soluta eligendi,
              placeat quas debitis, tempore cum ab cumque alias corporis eos
              dicta voluptatibus sint incidunt doloribus ut inventore minus, sit
              atque. Rerum eius voluptatibus temporibus! Autem cupiditate atque
              impedit sapiente porro repellendus dolor magnam aut, distinctio
              quae, adipisci aliquam beatae maiores placeat reiciendis dicta
              fuga, voluptas ipsa fugiat veritatis quasi? Ducimus quia incidunt
              quasi nobis molestias, veniam sequi similique sapiente. Autem,
              recusandae. Reiciendis nemo magni ad esse ipsa cum beatae nam
              dolores exercitationem molestiae. Inventore iure quisquam
              recusandae officia adipisci quod commodi voluptas repellendus at.
              Ullam accusamus distinctio tempora accusantium delectus magni
              laborum recusandae voluptates quos aspernatur. Doloremque,
              deserunt inventore? Ipsam adipisci cupiditate eius quis, vitae
              molestias. Voluptate iure enim consequuntur blanditiis, animi eius
              necessitatibus, debitis repudiandae vel, facilis laboriosam? Cum
              accusamus molestias obcaecati accusantium modi, voluptates
              reiciendis veritatis possimus culpa facere cumque saepe nam rerum
              similique dolorum unde aut, temporibus dignissimos, nostrum quas
              eum odit! Earum recusandae omnis, voluptatibus illum ex ab vel
              ipsam minus quae odit fugiat quis, voluptates beatae quaerat illo
              cumque provident amet accusantium ullam voluptatem. Voluptatibus
              nam, molestias rerum voluptatum beatae qui illo excepturi et
              dolorum hic ullam totam dignissimos iusto sint quia tempore
              magnam? Enim maxime porro autem praesentium quos officia explicabo
              accusantium modi, nisi harum perferendis obcaecati a nemo. Iure,
              nemo aliquid! Mollitia ratione facere veritatis, enim excepturi
              illum eligendi, numquam adipisci inventore accusantium id.
              Deserunt dolorem molestiae nemo ducimus ex numquam ab laudantium
              exercitationem consequatur fugit, quam similique et nisi.
              Dignissimos sequi neque incidunt ipsam, aliquid sit rem dolorum
              facilis. Aliquid dolorum nobis deserunt corporis voluptatum
              voluptates obcaecati, harum illum nam est repellendus, error
              debitis quisquam voluptate porro non magnam voluptatibus atque.
              Quas praesentium nihil doloremque officia. Praesentium quia
              officia delectus facilis aliquid expedita eaque sapiente doloribus
              autem, odio minus numquam! Ex officia dolor numquam magni eos
              veniam sapiente voluptatem amet! Quo assumenda dolore corporis,
              doloribus saepe non illum esse quisquam rem, numquam molestias
              vero cupiditate ab beatae voluptas perferendis exercitationem
              porro molestiae quod velit eius aspernatur. Alias voluptatibus
              sapiente nisi impedit ab a consectetur qui, fugit facilis
              blanditiis earum officiis culpa delectus consequuntur ipsum,
              cumque ipsa odio accusantium vel. Quae consequuntur rem aliquid
              animi similique sapiente excepturi, ratione vero quibusdam beatae
              velit error asperiores aut soluta qui minus reiciendis eaque
              itaque cum perferendis sequi! Iure pariatur asperiores odio eius
              ea iste illum doloremque aperiam, natus voluptatibus quas ducimus
              aliquid rerum recusandae. A voluptate illo perspiciatis alias
              temporibus. Quas veniam doloribus tempora perspiciatis culpa
              consequuntur quam quo esse architecto? Pariatur nulla laborum
              voluptate facere quod libero possimus praesentium error tempore
              doloribus necessitatibus, ipsam quasi alias saepe placeat commodi
              est odio suscipit atque provident consequuntur non unde? Nihil,
              expedita fuga explicabo omnis, voluptatum quisquam a beatae ut
              libero in tempora vero esse? Officia hic expedita voluptas earum
              dignissimos illo explicabo illum doloribus error! Repellendus
              corrupti, sed autem ab perferendis nostrum, assumenda tempora
              tempore esse beatae odit voluptas possimus blanditiis
              voluptatibus, cum magni dolor qui harum. Hic impedit dicta cum
              error temporibus itaque unde assumenda quo perferendis? Alias
              fuga, et tenetur laboriosam iusto modi, vel neque, sapiente
              consequatur corporis ab deserunt nemo nam? Placeat nemo, minima
              beatae doloremque et laborum id provident neque eligendi non iure
              ad nesciunt, magni fugiat. Nobis ipsum ut omnis similique hic
              repudiandae aliquam veniam rem in ducimus ipsa, expedita sapiente
              perspiciatis esse dolore, repellendus vero. Neque esse architecto
              vero vitae eum cum voluptatem commodi doloremque nam ullam,
              dolorem reiciendis minima cupiditate exercitationem, accusamus
              eligendi itaque voluptate perferendis quo laborum, corrupti nisi.
              Culpa libero dolores esse corrupti asperiores sed modi suscipit
              minus voluptatibus beatae nisi, ipsam, dolore amet saepe sequi
              itaque unde! Quidem dolores sed aliquid eius nesciunt voluptas
              sunt omnis quam, saepe excepturi quibusdam accusamus, voluptatem
              veritatis consequuntur nisi corporis blanditiis natus quia
              repellendus cumque ab. Culpa est fugiat dolores sapiente error
              commodi, libero suscipit eligendi perferendis minima aperiam fugit
              consequuntur dignissimos! Tenetur beatae perspiciatis nesciunt
              accusamus exercitationem, facere cupiditate, ullam mollitia
              eveniet culpa dolore non ratione cumque nulla ipsa officiis quia
              amet dolores debitis! Sequi, quia reprehenderit? Sunt mollitia
              quibusdam, ex impedit nesciunt accusantium debitis culpa illo eum
              aut ratione! Recusandae, sapiente. Voluptatum totam, maxime vitae
              obcaecati atque, hic voluptatibus error porro accusamus fugiat
              aliquam facere aliquid! Amet velit molestiae sit, voluptatibus
              fugit perspiciatis mollitia quidem repellendus aliquam accusantium
              officia maxime, dolorem deleniti, illo qui? Nesciunt, praesentium
              reprehenderit itaque, suscipit tempora dicta culpa quidem
              aspernatur in consequatur odit incidunt, eligendi fugit! Qui
              accusamus cumque rem delectus incidunt cupiditate sequi corrupti
              nostrum! Autem suscipit nemo sed tempore est minus nam ipsum
              consequatur animi minima, dicta accusantium vel praesentium a ab?
              Reiciendis, repudiandae tempore nihil porro at ipsa, veritatis
              amet libero minima dolore nisi ut unde deleniti? Quia aut quaerat
              facere, velit nisi, sunt aliquid sequi facilis libero repudiandae
              deserunt impedit necessitatibus nesciunt optio blanditiis tempore
              voluptatem delectus adipisci autem, praesentium dolores eius sint?
              Voluptatum quis laudantium laboriosam recusandae ipsam odio culpa
              molestias hic temporibus, blanditiis mollitia autem iste sunt
              maiores rem, dolorum animi nesciunt? Dolorum quod iusto suscipit
              quasi commodi. Nihil magni deserunt eligendi eum, cumque eos
              dignissimos architecto nobis facere reprehenderit natus, pariatur
              incidunt dolorem temporibus expedita quam amet dolorum culpa fugit
              eius. Nostrum, sunt consequuntur veniam porro quos magnam sit
              quidem molestiae fugiat enim ipsam placeat esse a tempore libero,
              ut reprehenderit temporibus illo. Architecto dignissimos quaerat
              quisquam corrupti eveniet neque beatae a quo in ipsum sunt earum
              odio, cumque exercitationem reiciendis quas totam? Beatae
              molestias ab alias aperiam atque reiciendis quod, perspiciatis
              maxime soluta ut quae pariatur, at rem esse modi eveniet qui
              magnam recusandae? Ea nobis ipsum sunt, iure asperiores ut atque,
              obcaecati impedit aperiam cupiditate sapiente repellendus at sint
              ad nulla facilis dolorum fugiat incidunt nisi! Mollitia quisquam,
              ducimus temporibus vero unde veritatis ipsum, aperiam commodi
              placeat impedit esse hic dicta recusandae!
            </h1>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default TopicalPage;
